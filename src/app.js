import {
  addFamilyMember, addReview, changePassword, createFamily, createOrder, deleteCustomer,
  deleteProduct, deleteUser, formatCurrency, getOrderTotal, inventoryMove, inviteFamilyMember,
  loadState, login, logout, lowStockProducts, orderStatuses, productCategories, removeFamilyMember,
  resetState, revenueByPeriod, roles, saveState, sendPromotion, topProducts, updateOrderStatus,
  upsertCoupon, upsertCustomer, upsertProduct, upsertUser
} from './store.js';

let state = loadState();
let active = 'dashboard';
let search = '';
let editingProductId = '';
let editingCustomerId = '';
let editingUserId = '';
const app = document.querySelector('#app');
const nav = [
  ['dashboard', 'Tổng quan'], ['account', 'Tài khoản'], ['products', 'Sản phẩm'], ['customers', 'Khách hàng'],
  ['orders', 'Đơn hàng'], ['inventory', 'Kho'], ['revenue', 'Doanh thu'], ['care', 'CSKH'], ['family', 'Gia đình']
];
const $ = (selector) => document.querySelector(selector);
const val = (id) => document.getElementById(id)?.value?.trim() || '';
const currentUser = () => state.users.find((user) => user.id === state.session);
const productName = (id) => state.products.find((product) => product.id === id)?.name || 'Sản phẩm đã xóa';
const customerName = (id) => state.customers.find((customer) => customer.id === id)?.name || 'Khách lẻ';
const persist = (next, message) => { state = saveState(next); toast(message); render(); };
const requireAdmin = () => currentUser()?.role === 'Admin';

function toast(message) {
  const box = document.createElement('div');
  box.className = 'toast';
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}

function render() {
  if (!state.session) return renderLogin();
  app.innerHTML = `
    <div class="shell intro">
      <aside class="sidebar glass">
        <div class="brand"><span class="logo">YS</span><div><b>Bán Yến Sào</b><small>Fluent 2 Manager</small></div></div>
        <nav>${nav.map(([id, label]) => `<button class="nav ${active === id ? 'active' : ''}" data-view="${id}">${label}</button>`).join('')}</nav>
        <button class="ghost" id="logoutBtn">Đăng xuất</button>
      </aside>
      <main class="main">
        <header class="topbar glass">
          <div><p>Xin chào</p><h1>${currentUser().fullName}</h1><span>${currentUser().role}</span></div>
          <input id="globalSearch" placeholder="Tìm kiếm nhanh..." value="${search}">
        </header>
        ${view()}
      </main>
    </div>`;
  document.querySelectorAll('.nav').forEach((button) => button.onclick = () => { active = button.dataset.view; render(); });
  $('#logoutBtn').onclick = () => persist(logout(state), 'Đã đăng xuất');
  $('#globalSearch').oninput = (event) => { search = event.target.value.toLowerCase(); render(); };
  bindForms();
  drawChart();
}

function renderLogin() {
  app.innerHTML = `<main class="loginScreen intro">
    <section class="loginCard glass">
      <div class="orb"></div><h1>Quản lý bán yến sào</h1><p>Đăng nhập bằng tài khoản thật được lưu trong trình duyệt. Mẫu: admin/admin123, nhanvien/nv123456, phuhuynh/ph123456.</p>
      <label>Tên đăng nhập<input id="loginUser" value="admin"></label><label>Mật khẩu<input id="loginPass" type="password" value="admin123"></label>
      <button id="loginBtn">Đăng nhập</button><button class="ghost" id="resetBtn">Khôi phục dữ liệu mẫu</button>
    </section></main>`;
  $('#loginBtn').onclick = () => { try { persist(login(state, val('loginUser'), val('loginPass')), 'Đăng nhập thành công'); } catch (error) { toast(error.message); } };
  $('#resetBtn').onclick = () => persist(resetState(), 'Đã khôi phục dữ liệu mẫu');
}

function view() {
  return ({ dashboard, account, products, customers, orders, inventory, revenue, care, family })[active]();
}

function dashboard() {
  const total = state.orders.reduce((sum, order) => order.status === 'Hoàn tất' ? sum + getOrderTotal(state, order) : sum, 0);
  return `<section class="grid stats">
    ${card('Doanh thu hoàn tất', formatCurrency(total))}${card('Sản phẩm', state.products.length)}${card('Đơn đang xử lý', state.orders.filter((o) => !['Hoàn tất', 'Đã hủy'].includes(o.status)).length)}${card('Cảnh báo tồn kho', lowStockProducts(state).length)}
  </section><section class="panel glass"><h2>Hoạt động mới</h2>${state.inventoryLogs.slice(0, 6).map((log) => `<p>${log.date} • ${log.type} ${log.quantity} ${productName(log.productId)} — ${log.note}</p>`).join('')}</section>`;
}

function card(label, value) { return `<article class="stat glass"><small>${label}</small><strong>${value}</strong></article>`; }

function account() {
  return `<section class="two">
    <div class="panel glass"><h2>Đổi mật khẩu</h2><form data-action="password"><input id="oldPass" type="password" placeholder="Mật khẩu cũ"><input id="newPass" type="password" placeholder="Mật khẩu mới"><button>Đổi mật khẩu</button></form></div>
    <div class="panel glass"><h2>Thêm / sửa người dùng ${requireAdmin() ? '' : '<small>(chỉ Admin)</small>'}</h2><form data-action="user"><input id="userName" placeholder="Tên đăng nhập"><input id="fullName" placeholder="Họ tên"><input id="age" type="number" placeholder="Tuổi"><select id="role">${roles.map((r) => `<option>${r}</option>`)}</select><button ${requireAdmin() ? '' : 'disabled'}>${editingUserId ? 'Cập nhật người dùng' : 'Lưu người dùng'}</button></form></div>
  </section><section class="panel glass"><h2>Phân quyền & quản lý người dùng</h2><table>${thead('Tên|Họ tên|Vai trò|Tuổi|Mua hàng|Thao tác')}${state.users.map((u) => `<tr><td>${u.username}</td><td>${u.fullName}</td><td>${u.role}</td><td>${u.age}</td><td>${u.canBuy ? 'Có' : 'Cần duyệt'}</td><td><button ${requireAdmin() ? '' : 'disabled'} data-edit-user="${u.id}">Sửa</button><button ${requireAdmin() ? '' : 'disabled'} data-del-user="${u.id}">Xóa</button></td></tr>`).join('')}</table></section>`;
}

function products() {
  const list = state.products.filter((p) => [p.name, p.category, p.description].join(' ').toLowerCase().includes(search));
  return `<section class="panel glass"><h2>Quản lý sản phẩm yến sào</h2><form class="wide" data-action="product"><input id="pName" placeholder="Tên sản phẩm"><select id="pCategory">${productCategories.map((c) => `<option>${c}</option>`)}</select><input id="pPrice" type="number" placeholder="Giá bán"><input id="pStock" type="number" placeholder="Tồn kho"><input id="pLow" type="number" placeholder="Ngưỡng cảnh báo"><input id="pImage" placeholder="URL hình ảnh"><input id="pDesc" placeholder="Mô tả"><button>${editingProductId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</button></form><div class="cards">${list.map((p) => `<article class="product"><img src="${p.image}" alt="${p.name}"><h3>${p.name}</h3><p>${p.category} • ${formatCurrency(p.price)}</p><p>Tồn: ${p.stock} / cảnh báo ${p.lowStock}</p><button data-edit-product="${p.id}">Nạp vào form</button><button data-del-product="${p.id}">Xóa</button></article>`).join('')}</div></section>`;
}

function customers() {
  const list = state.customers.filter((c) => [c.name, c.phone, c.email].join(' ').toLowerCase().includes(search));
  return `<section class="panel glass"><h2>Quản lý khách hàng</h2><form class="wide" data-action="customer"><input id="cName" placeholder="Tên khách"><input id="cPhone" placeholder="SĐT"><input id="cEmail" placeholder="Email"><input id="cAddress" placeholder="Địa chỉ"><button>${editingCustomerId ? 'Cập nhật khách hàng' : 'Lưu khách hàng'}</button></form><table>${thead('Tên|Điện thoại|Email|Điểm|Lịch sử mua|Thao tác')}${list.map((c) => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email}</td><td>${c.points}</td><td>${c.history.map((id) => `<span>${id}</span>`).join(' ')}</td><td><button data-edit-customer="${c.id}">Sửa</button><button data-del-customer="${c.id}">Xóa</button></td></tr>`).join('')}</table></section>`;
}

function orders() {
  const list = state.orders.filter((o) => [o.id, o.status, customerName(o.customerId)].join(' ').toLowerCase().includes(search));
  return `<section class="panel glass"><h2>Quản lý đơn hàng</h2><form class="wide" data-action="order"><select id="oCustomer">${state.customers.map((c) => `<option value="${c.id}">${c.name}</option>`)}</select><select id="oProduct">${state.products.map((p) => `<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`)}</select><input id="oQty" type="number" value="1" min="1"><select id="oCoupon"><option value="">Không mã giảm giá</option>${state.coupons.map((c) => `<option>${c.code}</option>`)}</select><input id="oNote" placeholder="Ghi chú"><button>Tạo đơn hàng</button></form><table>${thead('Mã|Khách|Ngày|Trạng thái|Tổng|Chi tiết|Thao tác')}${list.map((o) => `<tr><td>${o.id}</td><td>${customerName(o.customerId)}</td><td>${o.date}</td><td><select data-status="${o.id}">${orderStatuses.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`)}</select></td><td>${formatCurrency(getOrderTotal(state, o))}</td><td>${o.items.map((i) => `${productName(i.productId)} x${i.quantity}`).join('<br>')}</td><td><button data-print="${o.id}">In hóa đơn</button><button data-cancel="${o.id}">Hủy</button></td></tr>`).join('')}</table></section>`;
}

function inventory() {
  return `<section class="two"><div class="panel glass"><h2>Nhập kho / xuất kho / kiểm kê</h2><form data-action="inventory"><select id="iProduct">${state.products.map((p) => `<option value="${p.id}">${p.name}</option>`)}</select><select id="iType"><option>Nhập kho</option><option>Xuất kho</option><option>Kiểm kê tăng</option><option>Kiểm kê giảm</option></select><input id="iQty" type="number" value="1"><input id="iNote" placeholder="Ghi chú"><button>Ghi nhận</button></form></div><div class="panel glass"><h2>Cảnh báo sắp hết hàng</h2>${lowStockProducts(state).map((p) => `<p class="warn">${p.name}: còn ${p.stock}</p>`).join('') || '<p>Không có cảnh báo.</p>'}</div></section><section class="panel glass"><h2>Lịch sử nhập xuất</h2><table>${thead('Ngày|Loại|Sản phẩm|SL|Ghi chú')}${state.inventoryLogs.map((l) => `<tr><td>${l.date}</td><td>${l.type}</td><td>${productName(l.productId)}</td><td>${l.quantity}</td><td>${l.note}</td></tr>`).join('')}</table></section>`;
}

function revenue() {
  return `<section class="grid stats">${card('Ngày', formatCurrency(revenueByPeriod(state, 'day').at(-1)?.value || 0))}${card('Tháng', formatCurrency(revenueByPeriod(state, 'month').at(-1)?.value || 0))}${card('Năm', formatCurrency(revenueByPeriod(state, 'year').at(-1)?.value || 0))}</section><section class="two"><div class="panel glass"><h2>Biểu đồ doanh thu</h2><canvas id="revenueChart" height="220"></canvas></div><div class="panel glass"><h2>Top sản phẩm bán chạy</h2>${topProducts(state).map((p, i) => `<p>${i + 1}. ${p.name} — đã bán ${p.sold}</p>`).join('')}</div></section>`;
}

function care() {
  return `<section class="two"><div class="panel glass"><h2>Mã giảm giá</h2><form data-action="coupon"><input id="cpCode" placeholder="Mã"><input id="cpPercent" type="number" placeholder="% giảm"><input id="cpExpires" type="date"><button>Tạo mã</button></form>${state.coupons.map((c) => `<p>${c.code}: giảm ${c.percent}% đến ${c.expires}</p>`).join('')}</div><div class="panel glass"><h2>Gửi thông báo khuyến mãi</h2><form data-action="promo"><input id="pmTitle" placeholder="Tiêu đề"><input id="pmMsg" placeholder="Nội dung"><button>Gửi cho tất cả khách</button></form>${state.promotions.map((p) => `<p>${p.date} • ${p.title}</p>`).join('')}</div></section><section class="panel glass"><h2>Đánh giá sản phẩm & tích điểm</h2><form class="wide" data-action="review"><select id="rProduct">${state.products.map((p) => `<option value="${p.id}">${p.name}</option>`)}</select><select id="rCustomer">${state.customers.map((c) => `<option value="${c.id}">${c.name}</option>`)}</select><input id="rRating" type="number" min="1" max="5" value="5"><input id="rComment" placeholder="Nhận xét"><button>Lưu đánh giá</button></form>${state.reviews.map((r) => `<p>${productName(r.productId)} • ${r.rating}/5 • ${r.comment}</p>`).join('')}</section>`;
}

function family() {
  const families = state.families.filter((f) => requireAdmin() || f.members.includes(currentUser().id) || f.parentId === currentUser().id);
  return `<section class="panel glass"><h2>Tài khoản gia đình, phụ huynh và trẻ em</h2><form class="wide" data-action="family"><input id="fName" placeholder="Tên gia đình"><button>Tạo tài khoản gia đình</button></form>${families.map((f) => `<article class="family"><h3>${f.name}</h3><p>Phụ huynh: ${state.users.find((u) => u.id === f.parentId)?.fullName}</p><form data-action="invite" data-family="${f.id}"><input id="invite-${f.id}" placeholder="Email mời tham gia"><button>Gửi lời mời</button></form><div class="chips">${state.users.map((u) => `<button data-add-member="${f.id}|${u.id}">+ ${u.fullName}</button>`).join('')}</div><table>${thead('Thành viên|Vai trò|Tuổi|Hạn mức|Quyền mua|Hoạt động|Thao tác')}${f.members.map((id) => { const u = state.users.find((x) => x.id === id); return `<tr><td>${u.fullName}</td><td>${u.role}</td><td>${u.age}</td><td>${formatCurrency(u.monthlyLimit)}</td><td>${u.role === 'Trẻ em' ? 'Luôn cần phụ huynh duyệt' : u.canBuy ? 'Trong hạn mức' : 'Cần duyệt'}</td><td>${u.activity.slice(0, 2).map((a) => a.message).join('<br>')}</td><td><button data-remove-member="${f.id}|${u.id}">Xóa khỏi gia đình</button></td></tr>`; }).join('')}</table><p>Lời mời: ${f.invites.map((i) => `${i.email} (${i.status})`).join(', ') || 'chưa có'}</p></article>`).join('')}</section><section class="panel glass"><h2>Thông báo phụ huynh</h2>${state.notifications.filter((n) => n.userId === currentUser().id).map((n) => `<p>${n.date}: ${n.message}</p>`).join('') || '<p>Không có thông báo.</p>'}</section>`;
}

function thead(cols) { return `<thead><tr>${cols.split('|').map((c) => `<th>${c}</th>`).join('')}</tr></thead>`; }

function bindForms() {
  document.querySelectorAll('form').forEach((form) => form.onsubmit = (event) => { event.preventDefault(); handle(form); });
  document.querySelectorAll('[data-edit-user]').forEach((b) => b.onclick = () => fillUser(b.dataset.editUser));
  document.querySelectorAll('[data-del-user]').forEach((b) => b.onclick = () => persist(deleteUser(state, b.dataset.delUser), 'Đã xóa người dùng'));
  document.querySelectorAll('[data-del-product]').forEach((b) => b.onclick = () => persist(deleteProduct(state, b.dataset.delProduct), 'Đã xóa sản phẩm'));
  document.querySelectorAll('[data-edit-product]').forEach((b) => b.onclick = () => fillProduct(b.dataset.editProduct));
  document.querySelectorAll('[data-edit-customer]').forEach((b) => b.onclick = () => fillCustomer(b.dataset.editCustomer));
  document.querySelectorAll('[data-del-customer]').forEach((b) => b.onclick = () => persist(deleteCustomer(state, b.dataset.delCustomer), 'Đã xóa khách hàng'));
  document.querySelectorAll('[data-status]').forEach((s) => s.onchange = () => tryPersist(() => updateOrderStatus(state, s.dataset.status, s.value, currentUser().id), 'Đã cập nhật trạng thái'));
  document.querySelectorAll('[data-cancel]').forEach((b) => b.onclick = () => persist(updateOrderStatus(state, b.dataset.cancel, 'Đã hủy'), 'Đã hủy đơn'));
  document.querySelectorAll('[data-print]').forEach((b) => b.onclick = () => printInvoice(b.dataset.print));
  document.querySelectorAll('[data-add-member]').forEach((b) => b.onclick = () => { const [f, u] = b.dataset.addMember.split('|'); persist(addFamilyMember(state, f, u), 'Đã thêm thành viên'); });
  document.querySelectorAll('[data-remove-member]').forEach((b) => b.onclick = () => { const [f, u] = b.dataset.removeMember.split('|'); persist(removeFamilyMember(state, f, u), 'Đã xóa thành viên'); });
}

function tryPersist(fn, ok) { try { persist(fn(), ok); } catch (error) { toast(error.message); } }
function handle(form) {
  const action = form.dataset.action;
  try {
    if (action === 'password') persist(changePassword(state, currentUser().id, val('oldPass'), val('newPass')), 'Đã đổi mật khẩu');
    if (action === 'user') { persist(upsertUser(state, { id: editingUserId || undefined, username: val('userName'), fullName: val('fullName'), role: val('role'), age: Number(val('age')) }), 'Đã lưu người dùng'); editingUserId = ''; }
    if (action === 'product') { persist(upsertProduct(state, { id: editingProductId || undefined, name: val('pName'), category: val('pCategory'), price: val('pPrice'), stock: val('pStock'), lowStock: val('pLow'), image: val('pImage') || 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=500&q=80', description: val('pDesc') }), 'Đã lưu sản phẩm'); editingProductId = ''; }
    if (action === 'customer') { persist(upsertCustomer(state, { id: editingCustomerId || undefined, name: val('cName'), phone: val('cPhone'), email: val('cEmail'), address: val('cAddress') }), 'Đã lưu khách hàng'); editingCustomerId = ''; }
    if (action === 'order') { const p = state.products.find((x) => x.id === val('oProduct')); persist(createOrder(state, { customerId: val('oCustomer'), accountId: currentUser().id, discountCode: val('oCoupon'), note: val('oNote'), items: [{ productId: p.id, quantity: val('oQty'), price: p.price }] }), 'Đã tạo đơn hàng'); }
    if (action === 'inventory') persist(inventoryMove(state, val('iProduct'), val('iQty'), val('iType'), val('iNote')), 'Đã cập nhật kho');
    if (action === 'coupon') persist(upsertCoupon(state, { code: val('cpCode'), percent: val('cpPercent'), expires: val('cpExpires') }), 'Đã tạo mã giảm giá');
    if (action === 'promo') persist(sendPromotion(state, { title: val('pmTitle'), message: val('pmMsg'), sentTo: state.customers.map((c) => c.id) }), 'Đã gửi khuyến mãi');
    if (action === 'review') persist(addReview(state, { productId: val('rProduct'), customerId: val('rCustomer'), rating: val('rRating'), comment: val('rComment') }), 'Đã lưu đánh giá');
    if (action === 'family') persist(createFamily(state, val('fName'), currentUser().id), 'Đã tạo gia đình');
    if (action === 'invite') persist(inviteFamilyMember(state, form.dataset.family, val(`invite-${form.dataset.family}`)), 'Đã gửi lời mời');
  } catch (error) { toast(error.message); }
}

function fillProduct(id) {
  editingProductId = id;
  const p = state.products.find((item) => item.id === id);
  ['pName', 'pPrice', 'pStock', 'pLow', 'pImage', 'pDesc'].forEach((field, i) => { document.getElementById(field).value = [p.name, p.price, p.stock, p.lowStock, p.image, p.description][i]; });
  $('#pCategory').value = p.category;
  toast('Đã nạp dữ liệu để cập nhật sản phẩm.');
}

function fillCustomer(id) {
  editingCustomerId = id;
  const c = state.customers.find((item) => item.id === id);
  ['cName', 'cPhone', 'cEmail', 'cAddress'].forEach((field, i) => { document.getElementById(field).value = [c.name, c.phone, c.email, c.address][i]; });
  toast('Đã nạp dữ liệu để cập nhật khách hàng.');
}

function fillUser(id) {
  editingUserId = id;
  const u = state.users.find((item) => item.id === id);
  $('#userName').value = u.username; $('#fullName').value = u.fullName; $('#age').value = u.age; $('#role').value = u.role;
  toast('Đã nạp dữ liệu để cập nhật người dùng.');
}

function printInvoice(id) {
  const order = state.orders.find((item) => item.id === id);
  const content = `<h1>Hóa đơn ${order.id}</h1><p>Khách: ${customerName(order.customerId)}</p><p>Ngày: ${order.date}</p>${order.items.map((i) => `<p>${productName(i.productId)} x${i.quantity}: ${formatCurrency(i.price * i.quantity)}</p>`).join('')}<h2>Tổng: ${formatCurrency(getOrderTotal(state, order))}</h2>`;
  const win = window.open('', '_blank');
  win.document.write(content); win.document.close(); win.print();
}

function drawChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = revenueByPeriod(state, 'day');
  const max = Math.max(...data.map((d) => d.value), 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  data.forEach((d, i) => {
    const h = (d.value / max) * 160;
    ctx.fillStyle = `rgba(0, 120, 212, ${0.55 + i / 10})`;
    ctx.fillRect(30 + i * 80, 190 - h, 46, h);
    ctx.fillStyle = '#1b1a19'; ctx.fillText(d.label, 24 + i * 80, 210);
  });
}

render();
