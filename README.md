# Bán Yến Sào Fluent 2

Ứng dụng web quản lý bán yến sào chạy trực tiếp bằng trình duyệt, lưu dữ liệu thật vào `localStorage` của máy người dùng và có máy chủ tĩnh Node.js tích hợp.

## Chạy chương trình

```bash
npm start
```

Mở `http://localhost:5173` và đăng nhập bằng một trong các tài khoản mẫu:

| Vai trò | Tài khoản | Mật khẩu |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Nhân viên | `nhanvien` | `nv123456` |
| Phụ huynh | `phuhuynh` | `ph123456` |
| Thanh thiếu niên | `teen` | `teen1234` |
| Trẻ em | `treem` | `child123` |

## Tính năng chính

- Quản lý tài khoản: đăng nhập, đăng xuất, đổi mật khẩu, phân quyền Admin/Nhân viên/Phụ huynh/Trẻ em/Thanh thiếu niên, thêm/sửa/xóa người dùng.
- Quản lý sản phẩm: thêm/sửa/xóa/tìm kiếm, phân loại yến thô/yến tinh chế/yến chưng, giá bán, hình ảnh và tồn kho.
- Quản lý khách hàng: thêm/cập nhật/xóa/tìm kiếm, điểm thành viên và lịch sử mua hàng.
- Quản lý đơn hàng: tạo đơn, cập nhật trạng thái, hủy, xem chi tiết, tra cứu và in hóa đơn.
- Quản lý kho: nhập kho, xuất kho, kiểm kê, cảnh báo sắp hết hàng và lịch sử nhập xuất.
- Quản lý doanh thu: thống kê theo ngày/tháng/năm, top sản phẩm bán chạy và biểu đồ canvas.
- Chăm sóc khách hàng: tích điểm, mã giảm giá, thông báo khuyến mãi và đánh giá sản phẩm.
- Gia đình/phụ huynh: tạo gia đình, thêm con, mời thành viên, quản lý thông tin, xem hoạt động, hạn mức chi tiêu, phê duyệt đơn, thông báo đăng nhập/đặt hàng và xóa thành viên.

## Kiểm thử

```bash
npm test
```
