import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Trang chủ</Link>
      <Link to="/jobs">Việc làm thực tập</Link>
      {!user && <Link to="/login">Đăng nhập</Link>}
      {!user && <Link to="/register">Đăng ký</Link>}
      {user?.role === "student" && <Link to="/student/dashboard">Dashboard</Link>}
      {user?.role === "employer" && <Link to="/employer/dashboard">Dashboard</Link>}
      {user?.role === "admin" && <Link to="/admin/dashboard">Dashboard</Link>}
      {user && <button onClick={logout}>Đăng xuất</button>}
    </nav>
  );
}
