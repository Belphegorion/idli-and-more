import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { MenuItem } from '@/lib/models/MenuItem';
import { CategorySchema, CategoryReorderSchema } from '@/lib/validations';
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

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1 }).lean();

    // Attach item count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await MenuItem.countDocuments({
          categoryId: cat._id,
          isArchived: false,
        });
        return {
          ...cat,
          itemCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error: any) {
    console.error('Error in GET /api/admin/categories:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();

    const parsed = CategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const { name, order, isActive } = parsed.data;

    let baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const newCat = await Category.create({
      name,
      slug: finalSlug,
      order: order ?? (await Category.countDocuments()),
      isActive: isActive ?? true,
    });

    await logAudit({
      actorId: actorEmail,
      action: 'CATEGORY_CREATE',
      entity: 'Category',
      entityId: newCat._id.toString(),
      before: {},
      after: newCat.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, category: newCat }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/categories:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const body = await req.json();
    await connectToDatabase();

    // Check if reordering list of categories
    if (body.reorder && Array.isArray(body.categories)) {
      const parsedReorder = CategoryReorderSchema.safeParse({ categories: body.categories });
      if (!parsedReorder.success) {
        return NextResponse.json({ error: 'Invalid reorder array' }, { status: 400 });
      }

      for (const item of parsedReorder.data.categories) {
        await Category.findByIdAndUpdate(item.id, { $set: { order: item.order } });
      }

      revalidatePath('/api/menu');
      revalidatePath('/');

      return NextResponse.json({ success: true, message: 'Categories reordered' });
    }

    // Single category edit/rename
    const { id, name, isActive } = body;
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    }

    const cat = await Category.findById(id);
    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const before = cat.toObject();
    cat.name = name;
    if (typeof isActive === 'boolean') cat.isActive = isActive;
    await cat.save();

    await logAudit({
      actorId: actorEmail,
      action: 'CATEGORY_UPDATE',
      entity: 'Category',
      entityId: id,
      before,
      after: cat.toObject(),
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, category: cat });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/categories:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = req.headers.get('x-user-email') || 'owner';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const moveTo = searchParams.get('moveTo');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const existingItemsCount = await MenuItem.countDocuments({
      categoryId: id,
      isArchived: false,
    });

    if (existingItemsCount > 0) {
      if (!moveTo) {
        return NextResponse.json(
          {
            error: `Cannot delete category: ${existingItemsCount} active dishes are in this category. Please specify a destination category (moveTo) or remove dishes first.`,
            itemCount: existingItemsCount,
            requiresMove: true,
          },
          { status: 400 }
        );
      }

      // Move items to destination category
      await MenuItem.updateMany(
        { categoryId: id },
        { $set: { categoryId: moveTo, updatedBy: actorEmail } }
      );
    }

    const deleted = await Category.findByIdAndDelete(id);

    await logAudit({
      actorId: actorEmail,
      action: 'CATEGORY_DELETE',
      entity: 'Category',
      entityId: id,
      before: deleted?.toObject() || {},
      after: { movedItemsCount: existingItemsCount, destinationCategory: moveTo },
    });

    revalidatePath('/api/menu');
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/categories:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
