import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { Category } from '@/lib/models/Category';
import { MenuItemSchema, BulkMenuActionSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const isArchived = searchParams.get('archived') === 'true';
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('q')?.trim();
    const isExportCsv = searchParams.get('export') === 'csv';

    const filter: any = { isArchived };

    if (categoryId && categoryId !== 'all') {
      filter.categoryId = categoryId;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { nameHindi: { $regex: query, $options: 'i' } },
      ];
    }

    // CSV export mode
    if (isExportCsv) {
      const allItems = await MenuItem.find(filter)
        .populate('categoryId', 'name')
        .sort({ order: 1 })
        .lean();

      const headers = ['ID', 'Name', 'NameHindi', 'Category', 'Price', 'InStock', 'IsVeg', 'IsChefPick', 'Tags', 'Description'];
      const rows = allItems.map((item: any) => [
        item._id,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.nameHindi || '').replace(/"/g, '""')}"`,
        `"${(item.categoryId?.name || '').replace(/"/g, '""')}"`,
        item.price,
        item.inStock ? 'TRUE' : 'FALSE',
        item.isVeg ? 'TRUE' : 'FALSE',
        item.isChefPick ? 'TRUE' : 'FALSE',
        `"${item.tags.join(', ')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="menu_export_${Date.now()}.csv"`,
        },
      });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate('categoryId', 'name slug')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MenuItem.countDocuments(filter),
    ]);

    const categories = await Category.find().sort({ order: 1 }).lean();

    return NextResponse.json({
      success: true,
      items,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/menu:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'admin';
    const body = await req.json();

    // Check if this is a CSV import
    if (body.action === 'import_csv') {
      const csvItems: any[] = body.items;
      if (!Array.isArray(csvItems) || csvItems.length === 0) {
        return NextResponse.json({ error: 'No items provided for import' }, { status: 400 });
      }

      await connectToDatabase();
      let importedCount = 0;

      for (const raw of csvItems) {
        if (!raw.name || !raw.price) continue;
        const slug = slugify(raw.name);
        const existing = await MenuItem.findOne({ slug });

        if (!existing) {
          await MenuItem.create({
            name: raw.name,
            nameHindi: raw.nameHindi || '',
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            price: Number(raw.price),
            description: raw.description || '',
            categoryId: raw.categoryId,
            isVeg: raw.isVeg !== false,
            inStock: raw.inStock !== false,
            isChefPick: raw.isChefPick === true,
            tags: Array.isArray(raw.tags) ? raw.tags : [],
            updatedBy: actorEmail,
          });
          importedCount++;
        }
      }

      revalidatePath('/api/menu');
      revalidatePath('/');

      return NextResponse.json({
        success: true,
        message: `Imported ${importedCount} items successfully.`,
      });
    }

    // Standard single item creation
    const parsed = MenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const data = parsed.data;
    let baseSlug = slugify(data.name);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await MenuItem.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const newItem = await MenuItem.create({
      ...data,
      slug: finalSlug,
      updatedBy: actorEmail,
      isArchived: false,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'MENU_ITEM_CREATE',
      entity: 'MenuItem',
      entityId: newItem._id.toString(),
      before: {},
      after: newItem.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/menu:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Bulk Actions or Single Edit
export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'admin';
    const body = await req.json();

    await connectToDatabase();

    // Check if bulk action
    if (body.action && body.itemIds) {
      const parsedBulk = BulkMenuActionSchema.safeParse(body);
      if (!parsedBulk.success) {
        return NextResponse.json({ error: 'Invalid bulk parameters', details: parsedBulk.error.flatten() }, { status: 400 });
      }

      const { itemIds, action, inStock, categoryId, priceAdjustmentType, priceAdjustmentValue } = parsedBulk.data;

      if (action === 'set_stock' && typeof inStock === 'boolean') {
        await MenuItem.updateMany({ _id: { $in: itemIds } }, { $set: { inStock, updatedBy: actorEmail } });
      } else if (action === 'change_category' && categoryId) {
        await MenuItem.updateMany({ _id: { $in: itemIds } }, { $set: { categoryId, updatedBy: actorEmail } });
      } else if (action === 'archive') {
        await MenuItem.updateMany({ _id: { $in: itemIds } }, { $set: { isArchived: true, updatedBy: actorEmail } });
      } else if (action === 'restore') {
        await MenuItem.updateMany({ _id: { $in: itemIds } }, { $set: { isArchived: false, updatedBy: actorEmail } });
      } else if (action === 'adjust_price' && priceAdjustmentValue !== undefined) {
        const items = await MenuItem.find({ _id: { $in: itemIds } });
        for (const it of items) {
          let newPrice = it.price;
          if (priceAdjustmentType === 'percentage') {
            newPrice = Math.max(0, Math.round(it.price * (1 + priceAdjustmentValue / 100)));
          } else {
            newPrice = Math.max(0, Math.round(it.price + priceAdjustmentValue));
          }
          it.price = newPrice;
          it.updatedBy = actorEmail;
          await it.save();
        }
      }

      await logAudit({
        actorId: actorEmail,
        action: `BULK_${action.toUpperCase()}`,
        entity: 'MenuItem',
        entityId: itemIds.join(','),
        before: {},
        after: { action, count: itemIds.length },
      });

      revalidatePath('/api/menu');
      revalidatePath('/');

      return NextResponse.json({ success: true, message: 'Bulk action completed' });
    }

    // Single item update
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const existing = await MenuItem.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const beforeState = existing.toObject();

    Object.assign(existing, updateFields);
    existing.updatedBy = actorEmail;
    await existing.save();

    await logAudit({
      actorId: actorEmail,
      action: 'MENU_ITEM_UPDATE',
      entity: 'MenuItem',
      entityId: id,
      before: beforeState,
      after: existing.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, item: existing });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/menu:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Soft delete
export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'admin';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const before = item.toObject();
    item.isArchived = true;
    item.updatedBy = actorEmail;
    await item.save();

    await logAudit({
      actorId: actorEmail,
      action: 'MENU_ITEM_ARCHIVE',
      entity: 'MenuItem',
      entityId: id,
      before,
      after: item.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Item archived successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/menu:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
