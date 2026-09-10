import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { getStudentProfile } from "../api/profile";
import { fetchSavedJobs, saveJob } from "../api/jobs";
import JobCard from "../components/JobCard";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const userProfileKey = user?.id ? `student_profile_${user.id}` : null;

  const [profile, setProfile] = useState(() => {
    if (!userProfileKey) return {};
    return JSON.parse(localStorage.getItem(userProfileKey) || "null") || {};
  });

  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Tải thông tin hồ sơ
  useEffect(() => {
    localStorage.removeItem("student_profile"); // Xoá key cũ dùng chung

    if (!user?.id) return;

    const cached = userProfileKey ? JSON.parse(localStorage.getItem(userProfileKey) || "null") : null;
    if (cached) {
      setProfile(cached);
    }

    let isCurrent = true;
    getStudentProfile()
      .then(({ data }) => {
        if (isCurrent && data) {
          setProfile(data);
          if (userProfileKey) {
            localStorage.setItem(userProfileKey, JSON.stringify(data));
          }
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [user?.id, userProfileKey]);

  // Tải danh sách việc làm đã lưu từ Database
  useEffect(() => {
    if (!user?.id) return;

    let isCurrent = true;
    setLoadingSaved(true);
    fetchSavedJobs()
      .then((res) => {
        if (isCurrent && res.data) {
          const list = res.data.results || [];
          const ids = res.data.saved_job_ids || list.map((j) => j.id);
          setSavedJobs(list);
          setSavedJobIds(ids);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải việc làm đã lưu:", err);
      })
      .finally(() => {
        if (isCurrent) setLoadingSaved(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id]);

  const handleToggleSaveJob = async (jobId) => {
    try {
      const res = await saveJob(jobId);
      if (res.data?.saved) {
        setSavedJobIds((prev) => [...prev, jobId]);
      } else {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error("Lỗi khi lưu việc làm:", err);
    }
  };

  const displayName = profile.full_name || user?.full_name || user?.email?.split("@")[0] || "Bạn";
  const completionFields = ["full_name", "university", "major", "graduation_year", "address", "bio"];
  const completedFields = completionFields.filter((field) => profile[field]?.toString().trim()).length;
  const completion = Math.round((completedFields / completionFields.length) * 100);

  const quickStats = [
    { label: "Tin đã lưu", value: savedJobs.length, icon: "bi-heart", tab: "saved" },
    { label: "Đã ứng tuyển", value: 0, icon: "bi-send", tab: "applied" },
    { label: "Việc phù hợp", value: 0, icon: "bi-stars", tab: "recommended" },
  ];

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
            <Link
              key={stat.label}
              to={`/student/dashboard?tab=${stat.tab}`}
              className={`student-stat ${currentTab === stat.tab ? "border-danger shadow-sm" : ""}`}
            >
              <span className="student-stat-icon">
                <i className={`bi ${stat.icon}`} />
              </span>
              <span>
                <strong>{stat.value}</strong>
                <small>{stat.label}</small>
              </span>
              <i className="bi bi-arrow-up-right student-stat-arrow" />
            </Link>
          ))}
        </section>

        {/* TAB: VIỆC LÀM ĐÃ LƯU */}
        {currentTab === "saved" ? (
          <section className="student-dashboard-panel mt-4 p-4 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h4 fw-bold mb-1">
                  <i className="bi bi-heart-fill text-pink me-2" />
                  Việc làm đã lưu ({savedJobs.length})
                </h2>
                <p className="text-secondary small mb-0">
                  Các cơ hội việc làm bạn đã đánh dấu để theo dõi hoặc nộp đơn sau.
                </p>
              </div>
              <Link to="/student/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                <i className="bi bi-grid me-1" /> Về tổng quan
              </Link>
            </div>

            {loadingSaved ? (
              <div className="text-center py-5">
                <div className="spinner-border text-pink" role="status" />
                <p className="text-muted mt-2">Đang tải danh sách việc làm đã lưu...</p>
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-3 border">
                <i className="bi bi-heart fs-1 text-muted" />
                <p className="mt-2 text-secondary mb-3">Bạn chưa lưu việc làm nào.</p>
                <Link to="/jobs" className="btn btn-pink text-white rounded-pill px-4">
                  Khám phá việc làm ngay
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {savedJobs.map((job) => (
                  <div key={job.id} className="col-12 col-md-6 col-lg-4">
                    <JobCard
                      job={job}
                      onSave={handleToggleSaveJob}
                      isSaved={savedJobIds.includes(job.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* TAB TỔNG QUAN */
          <div className="student-dashboard-layout">
            <section className="student-dashboard-panel student-activity-panel">
              <div className="student-panel-heading">
                <div>
                  <span className="student-panel-kicker">HOẠT ĐỘNG GẦN ĐÂY</span>
                  <h2>Ứng tuyển của bạn</h2>
                </div>
                <Link to="/student/dashboard?tab=applied">
                  Xem tất cả <i className="bi bi-arrow-right" />
                </Link>
              </div>
              <div className="student-activity-list">
                <div className="student-dashboard-empty">
                  <i className="bi bi-inbox" />
                  <span> Chưa có dữ liệu ứng tuyển.</span>
                </div>
              </div>
            </section>

            <aside className="student-dashboard-panel student-profile-progress">
              <div className="student-panel-heading">
                <div>
                  <span className="student-panel-kicker">HỒ SƠ CỦA BẠN</span>
                  <h2>Mức độ hoàn thiện</h2>
                </div>
                <i className="bi bi-person-vcard" />
              </div>
              <div className="student-progress-value">
                <strong>{completion}%</strong>
                <span>Hoàn thiện hồ sơ</span>
              </div>
              <div
                className="progress student-progress-bar"
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className="progress-bar" style={{ width: `${completion}%` }} />
              </div>
              <p>Hồ sơ đầy đủ giúp bạn nổi bật hơn với nhà tuyển dụng.</p>
              <Link to="/student/profile" className="btn student-profile-link">
                Cập nhật hồ sơ <i className="bi bi-arrow-right ms-1" />
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
