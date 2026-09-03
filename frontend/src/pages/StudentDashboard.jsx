import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const quickStats = [
  { label: "Tin đã lưu", value: 0, icon: "bi-heart", tab: "saved" },
  { label: "Đã ứng tuyển", value: 0, icon: "bi-send", tab: "applied" },
  { label: "Việc phù hợp", value: 0, icon: "bi-stars", tab: "recommended" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const profile = JSON.parse(localStorage.getItem("student_profile") || "null") || {};
  const displayName = profile.full_name || user?.full_name || user?.email?.split("@")[0] || "Bạn";
  const completionFields = ["full_name", "university", "major", "graduation_year", "address", "bio"];
  const completion = Math.round(
    (completionFields.filter((field) => profile[field]?.toString().trim()).length /
      completionFields.length) * 100
  );

  return (
    <main className="student-dashboard-page">
      <div className="container py-4 py-lg-5">
        <section className="student-dashboard-hero">
          <div>
            <span className="student-dashboard-eyebrow">TRUNG TÂM CỦA BẠN</span>
            <h1>Chào {displayName}, sẵn sàng cho cơ hội mới?</h1>
            <p>Theo dõi hành trình tìm việc và khám phá những vị trí phù hợp với bạn.</p>
          </div>
          <Link to="/jobs" className="btn student-dashboard-primary">
            <i className="bi bi-search me-2" />Tìm việc ngay
          </Link>
        </section>

        <section className="student-dashboard-stats" aria-label="Tổng quan">
          {quickStats.map((stat) => (
            <Link key={stat.label} to={`/student/dashboard?tab=${stat.tab}`} className="student-stat">
              <span className="student-stat-icon"><i className={`bi ${stat.icon}`} /></span>
              <span><strong>{stat.value}</strong><small>{stat.label}</small></span>
              <i className="bi bi-arrow-up-right student-stat-arrow" />
            </Link>
          ))}
        </section>

        <div className="student-dashboard-layout">
          <section className="student-dashboard-panel student-activity-panel">
            <div className="student-panel-heading">
              <div><span className="student-panel-kicker">HOẠT ĐỘNG GẦN ĐÂY</span><h2>Ứng tuyển của bạn</h2></div>
              <Link to="/student/dashboard?tab=applied">Xem tất cả <i className="bi bi-arrow-right" /></Link>
            </div>
            <div className="student-activity-list">
              <div className="student-dashboard-empty">
                <i className="bi bi-inbox" />
                <span> Chưa có dữ liệu ứng tuyển.</span>
              </div>
            </div>
          </section>

          <aside className="student-dashboard-panel student-profile-progress">
            <div className="student-panel-heading"><div><span className="student-panel-kicker">HỒ SƠ CỦA BẠN</span><h2>Mức độ hoàn thiện</h2></div><i className="bi bi-person-vcard" /></div>
            <div className="student-progress-value"><strong>{completion}%</strong><span>Hoàn thiện hồ sơ</span></div>
            <div className="progress student-progress-bar" role="progressbar" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{ width: `${completion}%` }} /></div>
            <p>Hồ sơ đầy đủ giúp bạn nổi bật hơn với nhà tuyển dụng.</p>
            <Link to="/student/profile" className="btn student-profile-link">Cập nhật hồ sơ <i className="bi bi-arrow-right ms-1" /></Link>
          </aside>
        </div>

      </div>
    </main>
  );
}
