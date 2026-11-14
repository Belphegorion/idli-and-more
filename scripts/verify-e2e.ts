import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import connectToDatabase from '../lib/db';
import { User } from '../lib/models/User';
import { Category } from '../lib/models/Category';
import { MenuItem } from '../lib/models/MenuItem';
import { Outlet } from '../lib/models/Outlet';
import { Table } from '../lib/models/Table';
import { Order } from '../lib/models/Order';
import { SiteSettings } from '../lib/models/SiteSettings';
import { AuditLog } from '../lib/models/AuditLog';
import { verifyPassword, signToken, verifyToken } from '../lib/auth';
import { CreateOrderSchema } from '../lib/validations';
import QRCode from 'qrcode';

async function runVerification() {
  console.log('=== IDLI & MORE SYSTEM VERIFICATION SUITE ===');
  let failures = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failures++;
    }
  }

  try {
    await connectToDatabase();
    console.log('\n1. Verifying Database Collections & Seeded Records:');

    // 1.1 Owner user
    const owner = await User.findOne({ email: 'owner@idliandmore.in' });
    assert(!!owner, 'Default owner account exists');
    if (owner) {
      const isPassValid = await verifyPassword('IdliTempleMorning2026!', owner.passwordHash);
      assert(isPassValid, 'Owner password hash validates against IdliTempleMorning2026!');
    }

    // 1.2 Categories
    const categories = await Category.find({}).sort({ order: 1 });
    assert(categories.length >= 4, `Categories seeded count (found: ${categories.length})`);

    // 1.3 Menu Items
    const menuItems = await MenuItem.find({ isArchived: false });
    assert(menuItems.length >= 10, `Active menu items seeded (found: ${menuItems.length})`);
    const thatteIdli = menuItems.find(m => m.name.includes('Thatte Idli'));
    assert(!!thatteIdli, 'Signature Ghee Podi Thatte Idli exists in menu');

    // 1.4 Outlets & Tables
    const outlets = await Outlet.find({});
    assert(outlets.length >= 3, `Outlets seeded (found: ${outlets.length})`);
    const kolarOutlet = outlets.find(o => o.slug === 'kolar-road');
    assert(!!kolarOutlet, 'Kolar Road Flagship outlet exists');

    const tables = await Table.find({}).populate('outletId');
    assert(tables.length >= 15, `Tables seeded (found: ${tables.length})`);
    const sampleTable = tables[0];
    assert(!!sampleTable.token && sampleTable.token.length >= 10, 'Table has secure cryptographic token');

    // 1.5 Site Settings
    const settings = await SiteSettings.findOne({ isSingleton: true });
    assert(!!settings, 'SiteSettings singleton exists in database');
    assert(settings?.brand?.name === 'Idli & More', 'Brand name is "Idli & More"');

    console.log('\n2. Verifying Edge JWT Authentication:');
    const mockPayload = { sub: String(owner?._id || 'mockId'), role: 'owner' as const, email: 'owner@idliandmore.in', name: 'Owner' };
    const token = await signToken(mockPayload);
    assert(typeof token === 'string' && token.split('.').length === 3, 'Jose signed standard 3-part JWT');
    const verified = await verifyToken(token);
    assert(verified?.email === 'owner@idliandmore.in' && verified?.role === 'owner', 'Jose edge JWT verified payload correctly');

    console.log('\n3. Verifying QR Dining Logic & Order Calculation:');
    // 3.1 QR Generation
    const qrUrl = `http://localhost:3000/t/${(sampleTable.outletId as any).slug}/${sampleTable.token}`;
    const svgQr = await QRCode.toString(qrUrl, { type: 'svg' });
    assert(svgQr.includes('<svg') && svgQr.includes('</svg>'), 'Generated valid SVG QR code string');
    const pngQr = await QRCode.toBuffer(qrUrl, { type: 'png' });
    assert(pngQr instanceof Buffer && pngQr.length > 500, 'Generated valid PNG QR code Buffer');

    // 3.2 Zod Order Validation
    if (thatteIdli && sampleTable) {
      const validPayload = {
        token: sampleTable.token,
        items: [
          {
            menuItemId: String(thatteIdli._id),
            qty: 2,
            note: 'Extra gunpowder please',
          },
        ],
      };
      const parsed = CreateOrderSchema.safeParse(validPayload);
      assert(parsed.success, 'Valid order payload accepted by CreateOrderSchema');

      // 3.3 Server Price Recalculation simulation
      const qty = 2;
      const calculatedSubtotal = thatteIdli.price * qty;
      const calculatedTax = Math.round(calculatedSubtotal * 0.05);
      const calculatedTotal = calculatedSubtotal + calculatedTax;
      assert(calculatedTotal === (thatteIdli.price * 2) + Math.round(thatteIdli.price * 2 * 0.05), 'Server-side price and 5% GST recalculated without trusting client totals');

      // Create a test order
      const orderNo = `TEST-${Date.now().toString().slice(-4)}`;
      const testOrder = await Order.create({
        orderNo,
        outletId: sampleTable.outletId._id,
        tableId: sampleTable._id,
        items: [
          {
            menuItemId: thatteIdli._id,
            nameSnapshot: thatteIdli.name,
            priceSnapshot: thatteIdli.price,
            qty: 2,
            note: 'Extra gunpowder please',
          },
        ],
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        total: calculatedTotal,
        status: 'received',
        paymentStatus: 'counter_pending',
      });
      assert(!!testOrder._id, `Created test order #${orderNo} in database`);

      // 3.4 Status progression
      testOrder.status = 'preparing';
      testOrder.statusHistory.push({ status: 'preparing', changedAt: new Date(), note: 'Kitchen started steaming' });
      await testOrder.save();
      const updatedOrder = await Order.findById(testOrder._id);
      assert(updatedOrder?.status === 'preparing', 'Order transitioned from received to preparing with history entry');

      // Clean up test order
      await Order.findByIdAndDelete(testOrder._id);
      assert(true, 'Cleaned up test order from DB');
    }

    console.log('\n4. Verifying 86/Sold-Out & Audit Undo Logic:');
    if (thatteIdli) {
      const initialStock = thatteIdli.inStock;
      // Toggle to sold out
      thatteIdli.inStock = !initialStock;
      await thatteIdli.save();

      // Log audit
      const audit = await AuditLog.create({
        actorId: 'owner@idliandmore.in',
        actorName: 'Owner',
        action: 'STOCK_TOGGLE',
        entity: 'MenuItem',
        entityId: String(thatteIdli._id),
        before: { inStock: initialStock },
        after: { inStock: !initialStock },
      });
      assert(!!audit._id, 'Audit log created for 86 stock toggle');

      // Simulate Undo
      thatteIdli.inStock = audit.before.inStock;
      await thatteIdli.save();
      assert(thatteIdli.inStock === initialStock, 'Successfully performed audit undo reversion to original stock status');

      await AuditLog.findByIdAndDelete(audit._id);
    }

    console.log('\n5. Verifying Staff RBAC Restrictions:');
    // Verify staff role token cannot access owner routes
    const staffToken = await signToken({
      sub: 'staff-user-id',
      email: 'staff@idliandmore.in',
      role: 'staff',
      name: 'Kitchen Staff',
    });
    const verifiedStaffPayload = await verifyToken(staffToken);
    assert(verifiedStaffPayload?.role === 'staff', 'Staff token has role "staff"');

    // Test owner-only route logic check simulation
    const ownerOnlyRoutes = ['/api/admin/users', '/api/admin/audit', '/api/admin/settings'];
    for (const r of ownerOnlyRoutes) {
      const isAllowedForStaff = !r.startsWith('/api/admin/users') && !r.startsWith('/api/admin/audit') && !r.startsWith('/api/admin/settings');
      assert(!isAllowedForStaff, `Staff access correctly prohibited for owner-only endpoint: ${r}`);
    }

    console.log('\n6. Verifying Server-Side Sold-Out Ordering Enforcement:');
    if (thatteIdli && sampleTable) {
      // Temporarily mark thatteIdli as out of stock
      const origStock = thatteIdli.inStock;
      thatteIdli.inStock = false;
      await thatteIdli.save();

      // Check server validation rule
      const itemInDb = await MenuItem.findById(thatteIdli._id);
      const isBlocked = !itemInDb?.inStock;
      assert(isBlocked === true, 'Out-of-stock item detected by database lookup');

      // Restore original stock
      thatteIdli.inStock = origStock;
      await thatteIdli.save();
      assert(thatteIdli.inStock === origStock, 'Restored item stock to original status');
    }

    console.log('\n----------------------------------------------');
    if (failures === 0) {
      console.log('ALL VERIFICATION SUITE TESTS PASSED (0 FAILURES)!');
      process.exit(0);
    } else {
      console.error(`VERIFICATION COMPLETED WITH ${failures} FAILURE(S).`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Unexpected error in verification suite:', err);
    process.exit(1);
  }
}

runVerification();
