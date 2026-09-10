import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";

const signals = [
  ["users", "Người dùng", "bi-people", "/admin/users", "Cộng đồng đang hoạt động"],
  ["jobs", "Tin tuyển dụng", "bi-briefcase", "/admin/jobs", "Cơ hội trên marketplace"],
  ["applications", "Đơn ứng tuyển", "bi-file-earmark-text", "/admin/applications", "Hồ sơ đang được xử lý"],
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { client.get("/admin/stats/").then(({ data }) => setStats(data)).catch(() => setError("Không thể tải số liệu quản trị.")); }, []);

  return <section className="admin-content dashboard-rebuild">
    <div className="dashboard-heading motion-in">
      <div><span className="dashboard-date">HÔM NAY · QLPM</span><h2>Nhìn toàn cảnh.<br /><em>Hành động đúng lúc.</em></h2><p>Một góc nhìn rõ ràng về những gì đang diễn ra trong marketplace.</p></div>
      <div className="dashboard-heading-mark" aria-hidden="true"><span>Q</span><i /></div>
    </div>
    {error && <div className="alert alert-warning motion-in">{error}</div>}
    <div className="dashboard-board motion-in">
      <div className="board-lead"><span className="board-label">MARKETPLACE PULSE</span><strong>{stats?.jobs ?? "—"}</strong><h3>Tin tuyển dụng đang hiện diện</h3><p>Giữ cho nguồn cơ hội luôn mới, hữu ích và đáng tin cậy.</p><Link to="/admin/jobs" className="board-link">Mở danh sách tin <i className="bi bi-arrow-up-right" /></Link></div>
      <div className="board-note"><span className="signal-live"><i /> Hệ thống ổn định</span><p>API & xác thực<br /><strong>Operational</strong></p><p>Database<br /><strong>Operational</strong></p></div>
    </div>
    <div className="dashboard-grid">
      <div className="dashboard-signals"><div className="dashboard-section-title"><h3>Tín hiệu chính</h3><span>03 chỉ số</span></div>{signals.map(([key, label, icon, to, description], index) => <Link className="signal-row motion-in" style={{ "--motion-delay": `${index * 80 + 180}ms` }} to={to} key={key}><span className="signal-icon"><i className={`bi ${icon}`} /></span><span><strong>{label}</strong><small>{description}</small></span><b>{stats?.[key] ?? "—"}</b><i className="bi bi-arrow-up-right signal-arrow" /></Link>)}</div>
      <aside className="dashboard-actions motion-in" style={{ "--motion-delay": "380ms" }}><h3>Việc cần chú ý</h3><p>Đi đến nơi có thể tạo ra tác động ngay bây giờ.</p><Link to="/admin/reports"><span><i className="bi bi-flag" /> Báo cáo chờ xử lý</span><b>{stats?.pending_reports ?? "—"}</b><i className="bi bi-arrow-right" /></Link><Link to="/admin/jobs"><span><i className="bi bi-plus-circle" /> Quản lý tin tuyển dụng</span><i className="bi bi-arrow-right" /></Link></aside>
    </div>
  </section>;
}
