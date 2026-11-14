import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { Category } from '@/lib/models/Category';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    const items = await MenuItem.find({ isArchived: false }).sort({ order: 1 }).lean();

    return NextResponse.json({
      success: true,
      categories,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.warn('MongoDB query warning in GET /api/menu, using authentic seeded fallback:', error.message);
    const { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } = await import('@/lib/fallbackData');
    return NextResponse.json({
      success: true,
      categories: INITIAL_CATEGORIES,
      items: INITIAL_MENU_ITEMS,
      count: INITIAL_MENU_ITEMS.length,
      fallback: true,
    });
  }
}
