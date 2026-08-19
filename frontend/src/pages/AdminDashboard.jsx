import { useAuth } from "../store/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard Quản trị viên</h1>
      <p>
        Đăng nhập thành công với email <strong>{user?.email}</strong> (role: {user?.role})
      </p>
      {/* TODO: duyệt tin, quản lý tài khoản, danh mục, báo cáo vi phạm, thống kê hệ thống */}
    </div>
  );
}
