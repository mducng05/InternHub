import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { getStudentProfile } from "../api/profile";
import { fetchRecommendedJobs, fetchSavedJobs, saveJob } from "../api/jobs";
import { cancelApplication, fetchMyApplications } from "../api/applications";
import JobCard from "../components/JobCard";
import StudentCVStudio from "../components/StudentCVStudio";
import defaultLogo from "../assets/logo01.png";
import './StudentDashboard.css';

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

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingApplied, setLoadingApplied] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [cancelingApplicationId, setCancelingApplicationId] = useState(null);
  const [recommendationError, setRecommendationError] = useState("");

  // 1. Tải thông tin hồ sơ sinh viên
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

  // 2. Tải danh sách việc làm đã lưu từ Database
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

  useEffect(() => {
    if (!user?.id) return;
    let isCurrent = true;
    setLoadingRecommended(true);
    setRecommendationError("");
    fetchRecommendedJobs()
      .then(({ data }) => isCurrent && setRecommendedJobs(data?.results || []))
      .catch(() => isCurrent && setRecommendationError("Chưa tải được gợi ý. Hãy cập nhật chuyên ngành hoặc kỹ năng trong hồ sơ."))
      .finally(() => isCurrent && setLoadingRecommended(false));
    return () => { isCurrent = false; };
  }, [user?.id]);

  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm("Bạn muốn hủy hồ sơ ứng tuyển này?")) return;
    setCancelingApplicationId(applicationId);
    try {
      const { data } = await cancelApplication(applicationId);
      setAppliedJobs((previous) => previous.map((application) => application.id === applicationId
        ? { ...application, status: data.status, status_display: data.status_display }
        : application));
    } catch (error) {
      window.alert(error.response?.data?.detail || "Không thể hủy hồ sơ lúc này.");
    } finally {
      setCancelingApplicationId(null);
    }
  };

  // 3. Tải danh sách việc làm đã ứng tuyển từ Database
  useEffect(() => {
    if (!user?.id) return;

    let isCurrent = true;
    setLoadingApplied(true);
    fetchMyApplications()
      .then((res) => {
        if (isCurrent && res.data) {
          setAppliedJobs(res.data.results || []);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách việc làm đã ứng tuyển:", err);
      })
      .finally(() => {
        if (isCurrent) setLoadingApplied(false);
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
    { label: "Đã ứng tuyển", value: appliedJobs.length, icon: "bi-send", tab: "applied" },
    { label: "Việc phù hợp", value: recommendedJobs.length, icon: "bi-stars", tab: "recommended" },
  ];

  const getStatusBadge = (status, statusDisplay) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-clock me-1"></i>
            {statusDisplay || "Chờ xử lý"}
          </span>
        );
      case "shortlisted":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-person-check me-1"></i>
            {statusDisplay || "Đã vào danh sách chọn"}
          </span>
        );
      case "interview_invited":
        return (
          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-calendar-event me-1"></i>
            {statusDisplay || "Mời phỏng vấn"}
          </span>
        );
      case "accepted":
        return (
          <span className="badge bg-pink-subtle text-pink border border-pink px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-check-circle-fill me-1"></i>
            {statusDisplay || "Được nhận"}
          </span>
        );
      case "rejected":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-x-circle me-1"></i>
            {statusDisplay || "Bị từ chối"}
          </span>
        );
      case "cancelled":
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill small fw-semibold">
            <i className="bi bi-slash-circle me-1"></i>
            {statusDisplay || "Đã hủy"}
          </span>
        );
      default:
        return (
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small fw-semibold">
            {statusDisplay || status}
          </span>
        );
    }
  };

  const formatSalaryText = (min, max) => {
    if (min != null && max != null) {
      if (min === 0 && max === 0) return "Thỏa thuận";
      return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} triệu`;
    }
    if (min != null && min > 0) return `Từ ${(min / 1000000).toFixed(0)} triệu`;
    if (max != null && max > 0) return `Đến ${(max / 1000000).toFixed(0)} triệu`;
    return "Thỏa thuận";
  };

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

        {/* TAB 1: VIỆC LÀM ĐÃ ỨNG TUYỂN */}
        {currentTab === "cv" || currentTab === "resume" ? (
          <StudentCVStudio
            initialMode={currentTab === "resume" ? "upload" : "builder"}
            onProfileUpdate={(nextProfile) => {
              setProfile(nextProfile);
              if (userProfileKey) localStorage.setItem(userProfileKey, JSON.stringify(nextProfile));
            }}
            profile={profile}
            user={user}
          />
        ) : currentTab === "applied" ? (
          <section className="student-dashboard-panel mt-4 p-4 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h4 fw-bold mb-1" style={{ color: "#800f2f" }}>
                  <i className="bi bi-file-earmark-check-fill text-pink me-2" />
                  Việc làm đã ứng tuyển ({appliedJobs.length})
                </h2>
                <p className="text-secondary small mb-0">
                  Danh sách những vị trí bạn đã nộp hồ sơ. Trạng thái phản hồi từ nhà tuyển dụng sẽ được cập nhật liên tục tại đây.
                </p>
              </div>
              <Link to="/student/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                <i className="bi bi-grid me-1" /> Về tổng quan
              </Link>
            </div>

            {loadingApplied ? (
              <div className="text-center py-5">
                <div className="spinner-border text-pink" role="status" />
                <p className="text-muted mt-2">Đang tải danh sách việc làm đã ứng tuyển...</p>
              </div>
            ) : appliedJobs.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 border">
                <i className="bi bi-inbox fs-1 text-muted" />
                <p className="mt-2 text-secondary mb-3">Bạn chưa nộp hồ sơ ứng tuyển vào vị trí nào.</p>
                <Link to="/jobs" className="btn btn-pink text-white rounded-pill px-4">
                  <i className="bi bi-search me-1"></i> Khám phá việc làm ngay
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {appliedJobs.map((app) => (
                  <div
                    key={app.id}
                    className="applied-job-card border rounded-3 p-3 p-md-4 bg-white shadow-sm transition-all hover-shadow"
                    style={{ borderLeft: "4px solid #ff4d6d" }}
                  >
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div className="d-flex align-items-start gap-3">
                        <img
                          src={app.job?.company_logo || defaultLogo}
                          alt={app.job?.company_name}
                          className="rounded-3 border p-1 object-fit-contain flex-shrink-0"
                          width="56"
                          height="56"
                          onError={(e) => { e.currentTarget.src = defaultLogo; }}
                        />
                        <div>
                          <h3 className="h5 fw-bold mb-1">
                            <Link to={`/jobs/${app.job?.id}`} className="text-dark text-decoration-none hover-pink">
                              {app.job?.title}
                            </Link>
                          </h3>
                          <p className="text-secondary small mb-2">
                            <i className="bi bi-building me-1"></i>
                            {app.job?.company_name}
                          </p>
                          <div className="d-flex flex-wrap gap-3 small text-secondary">
                            <span>
                              <i className="bi bi-geo-alt me-1 text-pink"></i>
                              {app.job?.location}
                            </span>
                            <span>
                              <i className="bi bi-briefcase me-1 text-pink"></i>
                              {app.job?.internship_type_display || app.job?.internship_type || "Thực tập"}
                            </span>
                            <span>
                              <i className="bi bi-cash-coin me-1 text-pink"></i>
                              {formatSalaryText(app.job?.salary_min, app.job?.salary_max)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-column align-items-md-end gap-2">
                        {getStatusBadge(app.status, app.status_display)}
                        <Link className="btn btn-sm btn-outline-danger rounded-pill" to={`/chat?application_id=${app.id}`}>
                          <i className="bi bi-chat-dots me-1" /> Nhắn tin với nhà tuyển dụng
                        </Link>
                        {app.status === "pending" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            disabled={cancelingApplicationId === app.id}
                            onClick={() => handleCancelApplication(app.id)}
                          >
                            {cancelingApplicationId === app.id ? "Đang hủy…" : "Hủy ứng tuyển"}
                          </button>
                        )}
                        <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                          <i className="bi bi-calendar-check me-1"></i>
                          Nộp lúc: {new Date(app.applied_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* DÒNG CHI TIẾT: FILE CV ĐÃ NỘP & LỜI NHẮN */}
                    <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2 small">
                        {app.cv_url ? (
                          <a
                            href={app.cv_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                          >
                            <i className="bi bi-file-earmark-pdf text-danger"></i>
                            Xem CV đã nộp
                          </a>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-file-earmark me-1"></i>Đã tải lên CV
                          </span>
                        )}

                        {app.cover_letter && (
                          <span className="text-muted fst-italic ms-2 text-truncate" style={{ maxWidth: "320px" }}>
                            &quot;{app.cover_letter}&quot;
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/jobs/${app.job?.id}`}
                        className="btn btn-sm btn-outline-pink rounded-pill px-3 fw-medium"
                      >
                        Chi tiết tin tuyển dụng <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : currentTab === "recommended" ? (
          <section className="student-dashboard-panel mt-4 p-4 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h4 fw-bold mb-1" style={{ color: "#800f2f" }}><i className="bi bi-stars me-2" />Việc làm phù hợp ({recommendedJobs.length})</h2>
                <p className="text-secondary small mb-0">Gợi ý dựa trên kỹ năng và chuyên ngành trong hồ sơ của bạn.</p>
              </div>
              <Link to="/student/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">Về tổng quan</Link>
            </div>
            {loadingRecommended ? (
              <div className="text-center py-5"><div className="spinner-border text-pink" role="status" /></div>
            ) : recommendationError ? (
              <div className="text-center py-5 text-secondary">{recommendationError}<div className="mt-3"><Link to="/student/profile" className="btn btn-outline-danger rounded-pill">Cập nhật hồ sơ</Link></div></div>
            ) : recommendedJobs.length ? (
              <div className="row g-3">{recommendedJobs.map((job) => <div key={job.id} className="col-12 col-md-6 col-lg-4"><JobCard job={job} onSave={handleToggleSaveJob} isSaved={savedJobIds.includes(job.id)} /></div>)}</div>
            ) : (
              <div className="text-center py-5 text-secondary">Chưa có việc phù hợp. Thêm chuyên ngành hoặc kỹ năng vào hồ sơ để nhận gợi ý tốt hơn.<div className="mt-3"><Link to="/student/profile" className="btn btn-outline-danger rounded-pill">Cập nhật hồ sơ</Link></div></div>
            )}
          </section>
        ) : currentTab === "saved" ? (
          /* TAB 2: VIỆC LÀM ĐÃ LƯU */
          <section className="student-dashboard-panel mt-4 p-4 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h4 fw-bold mb-1" style={{ color: "#800f2f" }}>
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
              <div className="text-center py-5 bg-light rounded-4 border">
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
          /* TAB 3: TỔNG QUAN (OVERVIEW) */
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
                {loadingApplied ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-pink" role="status" />
                  </div>
                ) : appliedJobs.length === 0 ? (
                  <div className="student-dashboard-empty">
                    <i className="bi bi-inbox" />
                    <span> Chưa có dữ liệu ứng tuyển.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 mt-2">
                    {appliedJobs.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light"
                      >
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <img
                            src={app.job?.company_logo || defaultLogo}
                            alt=""
                            className="rounded-2 border p-1 bg-white object-fit-contain"
                            width="40"
                            height="40"
                          />
                          <div className="overflow-hidden">
                            <h4 className="h6 fw-bold mb-0 text-truncate">
                              <Link to={`/jobs/${app.job?.id}`} className="text-dark text-decoration-none">
                                {app.job?.title}
                              </Link>
                            </h4>
                            <small className="text-secondary">{app.job?.company_name}</small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                          {getStatusBadge(app.status, app.status_display)}
                          <Link className="btn btn-sm btn-outline-danger rounded-pill" to={`/chat?application_id=${app.id}`}>
                            <i className="bi bi-chat-dots me-1" /> Nhắn tin
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
