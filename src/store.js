const STORE_KEY = 'ban-yen-sao-fluent-v1';

export const roles = ['Admin', 'Nhân viên', 'Phụ huynh', 'Trẻ em', 'Thanh thiếu niên'];
export const productCategories = ['Yến thô', 'Yến tinh chế', 'Yến chưng'];
export const orderStatuses = ['Mới tạo', 'Chờ phụ huynh duyệt', 'Đã duyệt', 'Đang chuẩn bị', 'Đang giao', 'Hoàn tất', 'Đã hủy'];

const money = (value) => Number(value || 0);
const today = () => new Date().toISOString().slice(0, 10);
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
const clone = (value) => structuredClone(value);

export function seedState() {
  const adminId = 'u-admin';
  const staffId = 'u-staff';
  const parentId = 'u-parent';
  const teenId = 'u-teen';
  const childId = 'u-child';
  const customers = [
    { id: 'c-001', name: 'Nguyễn Minh Anh', phone: '0901001001', email: 'minhanh@example.com', address: 'Quận 1, TP.HCM', points: 120, history: [] },
    { id: 'c-002', name: 'Trần Gia Hân', phone: '0902002002', email: 'giahan@example.com', address: 'Cầu Giấy, Hà Nội', points: 70, history: [] }
  ];
  const products = [
    { id: 'p-001', name: 'Yến thô đảo thiên nhiên 100g', category: 'Yến thô', price: 4200000, stock: 12, lowStock: 5, image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=500&q=80', description: 'Tổ yến nguyên chất còn lông, phù hợp khách tự sơ chế.', sold: 5, reviews: [] },
    { id: 'p-002', name: 'Yến tinh chế rút lông 50g', category: 'Yến tinh chế', price: 2350000, stock: 22, lowStock: 8, image: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=500&q=80', description: 'Sạch lông, đóng hộp quà tặng.', sold: 12, reviews: [] },
    { id: 'p-003', name: 'Yến chưng đường phèn 6 hũ', category: 'Yến chưng', price: 540000, stock: 40, lowStock: 12, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=80', description: 'Hũ thủy tinh, dùng ngay, phù hợp gia đình.', sold: 24, reviews: [] }
  ];
  const orders = [
    { id: 'o-001', customerId: 'c-001', accountId: parentId, date: today(), status: 'Hoàn tất', items: [{ productId: 'p-002', quantity: 1, price: 2350000 }], discountCode: '', approvedBy: '', note: 'Khách nhận tại cửa hàng' },
    { id: 'o-002', customerId: 'c-002', accountId: staffId, date: today(), status: 'Đang giao', items: [{ productId: 'p-003', quantity: 2, price: 540000 }], discountCode: 'YEN10', approvedBy: '', note: 'Giao giờ hành chính' }
  ];
  customers[0].history.push('o-001');
  customers[1].history.push('o-002');
  return {
    session: null,
    users: [
      { id: adminId, username: 'admin', password: 'admin123', fullName: 'Quản trị viên', role: 'Admin', age: 34, parentId: '', monthlyLimit: 0, canBuy: true, wishList: [], activity: [] },
      { id: staffId, username: 'nhanvien', password: 'nv123456', fullName: 'Nhân viên bán hàng', role: 'Nhân viên', age: 25, parentId: '', monthlyLimit: 0, canBuy: true, wishList: [], activity: [] },
      { id: parentId, username: 'phuhuynh', password: 'ph123456', fullName: 'Phụ huynh mẫu', role: 'Phụ huynh', age: 38, parentId: '', monthlyLimit: 0, canBuy: true, wishList: [], activity: [] },
      { id: teenId, username: 'teen', password: 'teen1234', fullName: 'Thanh thiếu niên', role: 'Thanh thiếu niên', age: 15, parentId, monthlyLimit: 1200000, canBuy: true, wishList: ['p-003'], activity: [] },
      { id: childId, username: 'treem', password: 'child123', fullName: 'Tài khoản trẻ em', role: 'Trẻ em', age: 10, parentId, monthlyLimit: 300000, canBuy: false, wishList: [], activity: [] }
    ],
    products,
    customers,
    orders,
    inventoryLogs: [
      { id: 'i-001', date: today(), type: 'Nhập kho', productId: 'p-003', quantity: 24, note: 'Lô yến chưng mới' },
      { id: 'i-002', date: today(), type: 'Xuất kho', productId: 'p-002', quantity: 1, note: 'Bán đơn o-001' }
    ],
    coupons: [{ id: 'cp-001', code: 'YEN10', percent: 10, active: true, expires: '2026-12-31' }],
    promotions: [{ id: 'pm-001', title: 'Tặng 20 điểm khi mua yến chưng', message: 'Áp dụng cho combo 6 hũ trong tuần này.', sentTo: ['c-001'], date: today() }],
    reviews: [{ id: 'r-001', productId: 'p-003', customerId: 'c-002', rating: 5, comment: 'Vị thanh, đóng gói đẹp.', date: today() }],
    families: [{ id: 'f-001', name: 'Gia đình mẫu', parentId, members: [parentId, teenId, childId], invites: [{ id: 'inv-001', email: 'ongba@example.com', status: 'Đã gửi' }] }],
    notifications: [{ id: 'n-001', userId: parentId, message: 'Tài khoản trẻ em đã được liên kết và cần phê duyệt khi mua hàng.', date: today(), read: false }]
  };
}

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return seedState();
  const raw = storage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedState();
    saveState(seeded, storage);
    return seeded;
  }
  return JSON.parse(raw);
}

export function saveState(state, storage = globalThis.localStorage) {
  if (storage) storage.setItem(STORE_KEY, JSON.stringify(state));
  return state;
}

export function resetState(storage = globalThis.localStorage) {
  const state = seedState();
  saveState(state, storage);
  return state;
}

function logActivity(state, userId, message) {
  const user = state.users.find((item) => item.id === userId);
  if (user) user.activity.unshift({ id: uid('act'), date: new Date().toISOString(), message });
}

export function login(state, username, password) {
  const next = clone(state);
  const user = next.users.find((item) => item.username === username && item.password === password);
  if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
  next.session = user.id;
  logActivity(next, user.id, 'Đăng nhập hệ thống');
  if (user.parentId) notify(next, user.parentId, `${user.fullName} vừa đăng nhập.`);
  return next;
}

export function logout(state) {
  const next = clone(state);
  if (next.session) logActivity(next, next.session, 'Đăng xuất hệ thống');
  next.session = null;
  return next;
}

export function changePassword(state, userId, oldPassword, newPassword) {
  const next = clone(state);
  const user = next.users.find((item) => item.id === userId);
  if (!user || user.password !== oldPassword) throw new Error('Mật khẩu cũ không đúng.');
  user.password = newPassword;
  logActivity(next, userId, 'Đổi mật khẩu');
  return next;
}

export function upsertUser(state, data) {
  const next = clone(state);
  const users = next.users;
  if (data.id) Object.assign(users.find((item) => item.id === data.id), data);
  else users.push({ id: uid('u'), password: '12345678', monthlyLimit: 0, canBuy: data.role !== 'Trẻ em', wishList: [], activity: [], ...data });
  return next;
}

export function deleteUser(state, id) {
  const next = clone(state);
  next.users = next.users.filter((user) => user.id !== id);
  next.families.forEach((family) => { family.members = family.members.filter((memberId) => memberId !== id); });
  return next;
}

export function upsertProduct(state, data) {
  const next = clone(state);
  if (data.id) Object.assign(next.products.find((item) => item.id === data.id), { ...data, price: money(data.price), stock: money(data.stock), lowStock: money(data.lowStock) });
  else next.products.push({ id: uid('p'), sold: 0, reviews: [], ...data, price: money(data.price), stock: money(data.stock), lowStock: money(data.lowStock) });
  return next;
}

export function deleteProduct(state, id) {
  const next = clone(state);
  next.products = next.products.filter((product) => product.id !== id);
  return next;
}

export function upsertCustomer(state, data) {
  const next = clone(state);
  if (data.id) Object.assign(next.customers.find((item) => item.id === data.id), data);
  else next.customers.push({ id: uid('c'), points: 0, history: [], ...data });
  return next;
}

export function deleteCustomer(state, id) {
  const next = clone(state);
  next.customers = next.customers.filter((customer) => customer.id !== id);
  return next;
}

export function getOrderTotal(state, order) {
  const subtotal = order.items.reduce((sum, item) => sum + money(item.price) * money(item.quantity), 0);
  const coupon = state.coupons.find((item) => item.code === order.discountCode && item.active);
  return Math.round(subtotal * (1 - (coupon?.percent || 0) / 100));
}

export function createOrder(state, data) {
  const next = clone(state);
  const actor = next.users.find((user) => user.id === data.accountId);
  const order = { id: uid('o'), date: today(), status: 'Mới tạo', approvedBy: '', note: '', ...data, items: data.items.map((item) => ({ ...item, quantity: money(item.quantity), price: money(item.price) })) };
  const total = getOrderTotal(next, order);
  if (actor?.role === 'Trẻ em') order.status = 'Chờ phụ huynh duyệt';
  if (actor?.role === 'Thanh thiếu niên' && actor.monthlyLimit && total > actor.monthlyLimit) order.status = 'Chờ phụ huynh duyệt';
  if (actor?.role === 'Trẻ em' || order.status === 'Chờ phụ huynh duyệt') notify(next, actor.parentId, `${actor.fullName} tạo yêu cầu mua hàng ${order.id} trị giá ${formatCurrency(total)}.`);
  next.orders.unshift(order);
  const customer = next.customers.find((item) => item.id === order.customerId);
  if (customer) customer.history.unshift(order.id);
  logActivity(next, data.accountId, `Tạo đơn hàng ${order.id}`);
  return next;
}

export function updateOrderStatus(state, id, status, approverId = '') {
  const next = clone(state);
  const order = next.orders.find((item) => item.id === id);
  order.status = status;
  if (status === 'Đã duyệt') order.approvedBy = approverId;
  if (status === 'Hoàn tất') finalizeOrder(next, order);
  if (status === 'Đã hủy') logActivity(next, order.accountId, `Hủy đơn hàng ${order.id}`);
  return next;
}

function finalizeOrder(state, order) {
  if (order.finalized) return;
  order.items.forEach((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    if (!product) return;
    if (product.stock < item.quantity) throw new Error(`${product.name} không đủ tồn kho.`);
    product.stock -= item.quantity;
    product.sold += item.quantity;
    state.inventoryLogs.unshift({ id: uid('i'), date: today(), type: 'Xuất kho', productId: product.id, quantity: item.quantity, note: `Bán đơn ${order.id}` });
  });
  const customer = state.customers.find((item) => item.id === order.customerId);
  if (customer) customer.points += Math.floor(getOrderTotal(state, order) / 100000);
  order.finalized = true;
}

export function inventoryMove(state, productId, quantity, type, note) {
  const next = clone(state);
  const product = next.products.find((item) => item.id === productId);
  const amount = money(quantity);
  if (type === 'Nhập kho') product.stock += amount;
  if (type === 'Xuất kho' || type === 'Kiểm kê giảm') product.stock -= amount;
  if (type === 'Kiểm kê tăng') product.stock += amount;
  if (product.stock < 0) throw new Error('Tồn kho không được âm.');
  next.inventoryLogs.unshift({ id: uid('i'), date: today(), type, productId, quantity: amount, note });
  return next;
}

export function upsertCoupon(state, data) {
  const next = clone(state);
  if (data.id) Object.assign(next.coupons.find((item) => item.id === data.id), { ...data, percent: money(data.percent) });
  else next.coupons.push({ id: uid('cp'), active: true, ...data, percent: money(data.percent) });
  return next;
}

export function sendPromotion(state, data) {
  const next = clone(state);
  next.promotions.unshift({ id: uid('pm'), date: today(), ...data });
  data.sentTo.forEach((customerId) => {
    const customer = next.customers.find((item) => item.id === customerId);
    if (customer) next.notifications.unshift({ id: uid('n'), userId: customerId, message: `${data.title}: ${data.message}`, date: today(), read: false });
  });
  return next;
}

export function addReview(state, data) {
  const next = clone(state);
  next.reviews.unshift({ id: uid('r'), date: today(), ...data, rating: money(data.rating) });
  return next;
}

export function createFamily(state, name, parentId) {
  const next = clone(state);
  next.families.push({ id: uid('f'), name, parentId, members: [parentId], invites: [] });
  return next;
}

export function addFamilyMember(state, familyId, userId) {
  const next = clone(state);
  const family = next.families.find((item) => item.id === familyId);
  if (!family.members.includes(userId)) family.members.push(userId);
  const user = next.users.find((item) => item.id === userId);
  if (user && user.role !== 'Phụ huynh') user.parentId = family.parentId;
  return next;
}

export function inviteFamilyMember(state, familyId, email) {
  const next = clone(state);
  next.families.find((item) => item.id === familyId).invites.unshift({ id: uid('inv'), email, status: 'Đã gửi' });
  return next;
}

export function removeFamilyMember(state, familyId, userId) {
  const next = clone(state);
  const family = next.families.find((item) => item.id === familyId);
  family.members = family.members.filter((id) => id !== userId);
  const user = next.users.find((item) => item.id === userId);
  if (user) user.parentId = '';
  return next;
}

export function notify(state, userId, message) {
  if (!userId) return state;
  state.notifications.unshift({ id: uid('n'), userId, message, date: today(), read: false });
  return state;
}

export function revenueByPeriod(state, period) {
  const completed = state.orders.filter((order) => order.status === 'Hoàn tất');
  const groups = {};
  completed.forEach((order) => {
    const key = period === 'day' ? order.date : period === 'month' ? order.date.slice(0, 7) : order.date.slice(0, 4);
    groups[key] = (groups[key] || 0) + getOrderTotal(state, order);
  });
  return Object.entries(groups).map(([label, value]) => ({ label, value }));
}

export function topProducts(state) {
  return [...state.products].sort((a, b) => b.sold - a.sold).slice(0, 5);
}

export function lowStockProducts(state) {
  return state.products.filter((product) => product.stock <= product.lowStock);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money(value));
}
