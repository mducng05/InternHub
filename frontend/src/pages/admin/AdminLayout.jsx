import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import "./admin.css";

const links = [
  ["Tổng quan", "/admin/dashboard", "bi-grid-1x2"],
  ["Danh mục công việc", "/admin/job-categories", "bi-folder2-open"],
  ["Kỹ năng sinh viên", "/admin/student-skills", "bi-person-check"],
  ["Ngành nghề", "/admin/industries", "bi-diagram-3"],
  ["Kỹ năng", "/admin/skills", "bi-tools"],
  ["Địa điểm", "/admin/locations", "bi-geo-alt"],
  ["Hồ sơ sinh viên", "/admin/student-profiles", "bi-person-badge"],
  ["Hồ sơ doanh nghiệp", "/admin/employer-profiles", "bi-building"],
  ["Người dùng", "/admin/users", "bi-people"],
  ["Tin tuyển dụng", "/admin/jobs", "bi-briefcase"],
  ["Kỹ năng công việc", "/admin/job-skills", "bi-link-45deg"],
  ["Đơn ứng tuyển", "/admin/applications", "bi-file-earmark-text"],
  ["Báo cáo", "/admin/reports", "bi-flag"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "light");
  useEffect(() => { localStorage.setItem("admin-theme", theme); }, [theme]);
  return <div className={`admin-shell admin-theme-${theme}`}>
    <aside className="admin-sidebar">
      <div className="admin-brand"><span>Q</span><div><strong>QLPM</strong><small>Admin workspace</small></div></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav>{links.map(([label, to, icon], index) => <NavLink key={to} to={to} end={to === "/admin/dashboard"}><span className="nav-index">0{index + 1}</span><i className={`bi ${icon}`} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}><i className={`bi ${theme === "light" ? "bi-moon-stars" : "bi-sun"}`} /><span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span></button><button className="admin-back" onClick={() => navigate("/")}><i className="bi bi-arrow-up-right" /> Về trang chính</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="eyebrow">QLPM / CONTROL ROOM</span><h1>Không gian quản trị</h1></div><div className="admin-user"><div><strong>{user?.full_name || user?.email}</strong><small>Administrator</small></div><span className="admin-avatar">{user?.email?.[0]?.toUpperCase() || "A"}</span><button title="Đăng xuất" onClick={logout}><i className="bi bi-box-arrow-right" /></button></div></header>
      <Outlet />
    </main>
  </div>;
}
