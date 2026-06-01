import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, inventoryMove, login, seedState, updateOrderStatus, lowStockProducts, revenueByPeriod, addFamilyMember } from '../src/store.js';

test('login creates a real session and logs activity', () => {
  const state = login(seedState(), 'admin', 'admin123');
  assert.equal(state.session, 'u-admin');
  assert.match(state.users.find((user) => user.id === 'u-admin').activity[0].message, /Đăng nhập/);
});

test('completed order decreases stock, records history, and increases points', () => {
  let state = seedState();
  const stockBefore = state.products.find((p) => p.id === 'p-003').stock;
  state = createOrder(state, { customerId: 'c-001', accountId: 'u-admin', discountCode: '', note: '', items: [{ productId: 'p-003', quantity: 2, price: 540000 }] });
  const orderId = state.orders[0].id;
  state = updateOrderStatus(state, orderId, 'Hoàn tất', 'u-admin');
  assert.equal(state.products.find((p) => p.id === 'p-003').stock, stockBefore - 2);
  assert.equal(state.orders[0].finalized, true);
  assert.ok(state.customers.find((c) => c.id === 'c-001').points > 120);
});

test('child orders require parent approval and notify parent', () => {
  const state = createOrder(seedState(), { customerId: 'c-001', accountId: 'u-child', discountCode: '', note: '', items: [{ productId: 'p-003', quantity: 1, price: 540000 }] });
  assert.equal(state.orders[0].status, 'Chờ phụ huynh duyệt');
  assert.equal(state.notifications[0].userId, 'u-parent');
});

test('inventory movements and low-stock detection are persisted in state', () => {
  let state = seedState();
  state = inventoryMove(state, 'p-001', 9, 'Xuất kho', 'Kiểm tra cảnh báo');
  assert.equal(state.products.find((p) => p.id === 'p-001').stock, 3);
  assert.ok(lowStockProducts(state).some((p) => p.id === 'p-001'));
});

test('family member links child to parent account', () => {
  let state = seedState();
  state = addFamilyMember(state, 'f-001', 'u-child');
  assert.equal(state.users.find((u) => u.id === 'u-child').parentId, 'u-parent');
});

test('revenue groups completed orders by day', () => {
  const state = seedState();
  const revenue = revenueByPeriod(state, 'day');
  assert.ok(revenue.at(-1).value > 0);
});
