import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import defaultLogo from "../assets/logo01.png";
import { fetchJobDetail, saveJob } from "../api/jobs";
import { useAuth } from "../store/AuthContext";
import ApplyModal from "../components/ApplyModal";
import './JobDetail.css';

const internshipTypeLabels = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  remote: "Từ xa",
  hybrid: "Kết hợp",
};

const experienceLabels = {
  no_experience: "Không yêu cầu kinh nghiệm",
  under_1_year: "Dưới 1 năm",
  "1_year": "1 năm",
  "2_years_plus": "Trên 2 năm",
};

const educationLabels = {
  year_2: "Năm 2",
  year_3: "Năm 3",
  year_4: "Năm 4",
  graduated: "Đã tốt nghiệp",
};

const formatList = (value, fallback) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|•|;|(?<=\.)\s+(?=[A-ZÀ-Ỹ])/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  return fallback;
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật");

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let active = true;
    setLoading(true);
    fetchJobDetail(id)
      .then((response) => {
        if (active && response.data) {
          setJob(response.data);
          setSaved(Boolean(response.data.is_saved));
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      })
      .catch(() => active && setJob(null))
      .finally(() => {
        if (active) {
          setLoading(false);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      });
    return () => { active = false; };
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSavingJob(true);
    try {
      const res = await saveJob(job.id);
      setSaved(Boolean(res.data.saved));
    } catch (err) {
      console.error("Lỗi khi lưu việc làm:", err);
    } finally {
      setSavingJob(false);
    }
  };

  if (loading) {
    return <main className="job-detail-page bg-light min-vh-100 py-5"><div className="text-center py-5"><div className="spinner-border text-pink" role="status"></div><p className="text-muted mt-2">Đang tải thông tin việc làm...</p></div></main>;
  }

  if (!job) {
    return <main className="job-detail-page bg-light min-vh-100 py-5"><div className="container text-center py-5"><i className="bi bi-search fs-1 text-muted"></i><h2 className="mt-3">Không tìm thấy việc làm</h2><Link to="/jobs" className="btn btn-pink text-white mt-2">Quay lại danh sách</Link></div></main>;
  }

  const logoUrl = job?.employer?.logo || job?.employer_profile?.logo || job?.company_logo || defaultLogo;
  const companyName =
    job?.employer?.company_name ||
    job?.employer_profile?.company_name ||
    (typeof job?.employer === "string" ? job.employer : null) ||
    job?.company_name ||
    "Doanh nghiệp tuyển dụng";
  const employer = job?.employer || job?.employer_profile || {};
  const companySize = employer?.company_size_display || employer?.company_size || "Chưa cập nhật";
  const industry = employer?.industry?.name || employer?.industry_name || "Chưa cập nhật";
  const companyAddress = employer?.address || "Chưa cập nhật";
  const location =
    job?.location?.name ||
    job?.location_name ||
    (typeof job?.location === "string" ? job.location : null) ||
    "Toàn quốc";
  const type = job?.internship_type_display || internshipTypeLabels[job?.internship_type] || job?.employment_type || "Không xác định";

  const formatSalary = () => {
    if (job?.salary) return job.salary;
    const min = job?.salary_min ?? job?.min_salary;
    const max = job?.salary_max ?? job?.max_salary;

    if (min != null && max != null) {
      if (min === 0 && max === 0) return "Thỏa thuận";
      return `${Number(min).toLocaleString("vi-VN")} - ${Number(max).toLocaleString("vi-VN")} VNĐ`;
    }
    if (min != null && min > 0) {
      return `Từ ${Number(min).toLocaleString("vi-VN")} VNĐ`;
    }
    if (max != null && max > 0) {
      return `Đến ${Number(max).toLocaleString("vi-VN")} VNĐ`;
    }
    return "Thỏa thuận";
  };
  const salary = formatSalary();

  const experienceValue = job?.experience_level_display || job?.experience_level || job?.experience;
  const experience = experienceLabels[experienceValue] || experienceValue || "Không yêu cầu kinh nghiệm";
  const educationValue = job?.min_academic_year_display || job?.min_academic_year || job?.academic_year;
  const education = educationLabels[educationValue] || educationValue || "Không yêu cầu cụ thể";
  const skillNames = Array.isArray(job?.skills)
    ? job.skills.map((skill) => skill?.name || skill).filter(Boolean).join(", ")
    : job?.skills;
  const expertise = skillNames || job?.job_category?.name || job?.job_category_name || "Chuyên môn liên quan đến vị trí tuyển dụng";
  const requirements = formatList(job?.requirements, []);
  const benefits = formatList(job?.benefits || job?.benefit, []);

  return (
    <main className="job-detail-page bg-light min-vh-100 py-4 py-md-5">
      <div className="container">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/jobs");
            }
          }}
          className="btn btn-link text-decoration-none text-secondary small p-0 d-inline-flex align-items-center gap-2 mb-3 border-0 bg-transparent shadow-none"
        >
          <i className="bi bi-arrow-left"></i> Quay lại danh sách việc làm
        </button>

        <div className="row g-3 align-items-start mb-3">
          <section className="col-lg-8">
            <div className="job-detail-hero job-detail-job-box bg-white border rounded-3 shadow-sm p-3 p-md-4 text-start">
              {job?.is_featured && <span className="badge bg-warning text-dark mb-2"><i className="bi bi-star-fill me-1"></i>Nổi bật</span>}
              <h1 className="h3 fw-bold mb-2">{job.title}</h1>
              <p className="text-secondary mb-2"><i className="bi bi-building me-2"></i>{companyName}</p>
              <div className="d-flex flex-wrap gap-2 small text-secondary">
                <span><i className="bi bi-geo-alt me-1"></i>{location}</span>
                <span><i className="bi bi-briefcase me-1"></i>{type}</span>
              </div>

              <div className="job-detail-overview mt-4 pt-3 border-top">
                <h2 className="h5 fw-bold mb-3"><i className="bi bi-grid-1x2-fill text-pink me-2"></i>Tổng quan</h2>
                <div className="row g-3">
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-cash-coin"></i><div><small>Mức lương</small><strong>{salary}</strong></div></div></div>
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-geo-alt"></i><div><small>Địa điểm</small><strong>{location}</strong></div></div></div>
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-calendar-event"></i><div><small>Hạn ứng tuyển</small><strong>{formatDate(job.deadline)}</strong></div></div></div>
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-people"></i><div><small>Số lượng tuyển</small><strong>{job.num_positions || "Chưa cập nhật"}</strong></div></div></div>
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-award"></i><div><small>Kinh nghiệm</small><strong>{experience}</strong></div></div></div>
                  <div className="col-sm-6"><div className="job-overview-item"><i className="bi bi-mortarboard"></i><div><small>Học vấn</small><strong>{education}</strong></div></div></div>
                  <div className="col-12"><div className="job-overview-item"><i className="bi bi-tools"></i><div><small>Chuyên môn</small><strong>{expertise}</strong></div></div></div>
                </div>
              </div>
            </div>
          </section>

          <aside className="col-lg-4">
            <div className="job-company-box bg-white border rounded-3 shadow-sm p-3 p-md-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="job-company-logo rounded-3 border p-1 object-fit-contain"
                  width="72"
                  height="72"
                  onError={(event) => { event.currentTarget.src = defaultLogo; }}
                />
                <h2 className="h5 fw-bold mb-0">{companyName}</h2>
              </div>
              <div className="job-company-facts small text-secondary">
                <p><i className="bi bi-people me-2"></i><span className="job-company-label">Quy mô</span><strong>{companySize}</strong></p>
                <p><i className="bi bi-building-gear me-2"></i><span className="job-company-label">Lĩnh vực</span><strong>{industry}</strong></p>
                <p><i className="bi bi-geo-alt me-2"></i><span className="job-company-label">Địa chỉ</span><strong>{companyAddress}</strong></p>
              </div>
              {employer?.website ? (
                <a href={employer.website} target="_blank" rel="noreferrer" className="btn btn-outline-pink w-100 mt-2">Xem trang công ty <i className="bi bi-arrow-up-right ms-1"></i></a>
              ) : (
                <Link to={`/companies/${employer?.id || companyName}`} className="btn btn-outline-pink w-100 mt-2">Xem trang công ty <i className="bi bi-arrow-right ms-1"></i></Link>
              )}
            </div>

            <div className="job-detail-actions bg-white border rounded-3 shadow-sm p-3 p-md-4 mt-3">
              <button
                type="button"
                className="btn btn-pink text-white w-100 fw-semibold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => setIsApplyModalOpen(true)}
              >
                <i className="bi bi-send-fill"></i>
                Ứng tuyển ngay
              </button>
              <button
                type="button"
                className={`btn w-100 mt-2 ${saved ? "btn-danger text-white" : "btn-outline-danger"}`}
                onClick={handleToggleSave}
                disabled={savingJob}
              >
                <i className={`bi ${saved ? "bi-bookmark-fill" : "bi-bookmark"} me-2`}></i>
                {savingJob ? "Đang xử lý..." : (saved ? "Đã lưu việc làm" : "Lưu việc làm")}
              </button>
            </div>
          </aside>
        </div>

        <div className="row g-3 mt-0 align-items-start">
          <div className="col-lg-8 job-detail-content">
            <section className="job-detail-section bg-white border rounded-3 shadow-sm p-3 p-md-4">
              <h2 className="h5 fw-bold mb-3"><i className="bi bi-file-text text-pink me-2"></i>Mô tả công việc</h2>
              <div className="job-detail-copy">{job.description || "Thông tin mô tả công việc đang được cập nhật."}</div>
            </section>

            <section className="job-detail-section bg-white border rounded-3 shadow-sm p-3 p-md-4">
              <h2 className="h5 fw-bold mb-3"><i className="bi bi-person-check text-pink me-2"></i>Yêu cầu ứng viên</h2>
              <ul className="job-detail-list">
                {requirements.length > 0 ? (
                  requirements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                ) : (
                  <li className="text-muted list-unstyled">Thông tin yêu cầu ứng viên đang được cập nhật.</li>
                )}
              </ul>
            </section>

            <section className="job-detail-section bg-white border rounded-3 shadow-sm p-3 p-md-4">
              <h2 className="h5 fw-bold mb-3"><i className="bi bi-gift text-pink me-2"></i>Quyền lợi ứng viên</h2>
              <ul className="job-detail-list">
                {benefits.length > 0 ? (
                  benefits.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                ) : (
                  <li className="text-muted list-unstyled">Thông tin quyền lợi đang được cập nhật.</li>
                )}
              </ul>
            </section>
          </div>

        </div>
      </div>

      {/* POPUP ỨNG TUYỂN */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          companyName={companyName}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </main>
  );
}
