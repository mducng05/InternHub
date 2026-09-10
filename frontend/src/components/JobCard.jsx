import { Link, useNavigate } from "react-router-dom";
import defaultLogo from "../assets/logo01.png";

export default function JobCard({ job, onSave, isSaved }) {
  const navigate = useNavigate();
  if (!job) return null;

  // 1. Logo Doanh nghiệp
  const logoUrl =
    job?.employer?.logo ||
    job?.employer_profile?.logo ||
    job?.company?.logo ||
    job?.employer_logo ||
    job?.company_logo ||
    defaultLogo;

  // 2. Tên Doanh nghiệp
  const companyName =
    job?.employer?.company_name ||
    job?.employer_profile?.company_name ||
    job?.company?.name ||
    job?.employer_name ||
    job?.company_name ||
    "Doanh nghiệp tuyển dụng";

  // 3. Địa điểm
  const locationName =
    job?.location?.name ||
    job?.location_name ||
    (typeof job?.location === "string" ? job.location : "Toàn quốc");

  // 4. Độ tuổi
  const ageRequirement =
    job?.age_requirement ||
    job?.age_range ||
    (job?.min_age !== undefined && job?.max_age !== undefined
      ? `${job.min_age} - ${job.max_age} tuổi`
      : job?.min_age !== undefined
        ? `Từ ${job.min_age} tuổi`
        : job?.max_age !== undefined
          ? `Đến ${job.max_age} tuổi`
          : "Không giới hạn");

  // 5. Hình thức làm việc
  const internshipTypeLabels = {
    full_time: "Toàn thời gian",
    part_time: "Bán thời gian",
    remote: "Từ xa",
    hybrid: "Kết hợp",
  };
  const employmentType =
    job?.internship_type_display ||
    job?.internship_type_label ||
    job?.employment_type ||
    job?.internship_type ||
    job?.job_type ||
    "Không xác định";
  const employmentTypeLabel =
    internshipTypeLabels[employmentType] || employmentType;

  // 6. Định dạng Mức lương
  const formatSalary = () => {
    if (job?.salary) return job.salary;
    const min = job?.salary_min ?? job?.min_salary;
    const max = job?.salary_max ?? job?.max_salary;

    if (min !== undefined && min !== null && max !== undefined && max !== null) {
      if (min === 0 && max === 0) return "Thỏa thuận";
      const minText = min >= 1000000 ? `${min / 1000000} triệu` : `${min.toLocaleString("vi-VN")} đ`;
      const maxText = max >= 1000000 ? `${max / 1000000} triệu` : `${max.toLocaleString("vi-VN")} đ`;
      return `${minText} - ${maxText}`;
    }
    if (min !== undefined && min !== null && min > 0) {
      return `Từ ${min >= 1000000 ? `${min / 1000000} triệu` : `${min.toLocaleString("vi-VN")} đ`}`;
    }
    if (max !== undefined && max !== null && max > 0) {
      return `Đến ${max >= 1000000 ? `${max / 1000000} triệu` : `${max.toLocaleString("vi-VN")} đ`}`;
    }
    return "Thỏa thuận";
  };

  const handleCardClick = (e) => {
    // Không chuyển trang nếu bấm vào nút Lưu/Yêu thích
    if (e.target.closest("button") || e.target.closest(".job-save-button")) {
      return;
    }
    navigate(`/jobs/${job?.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card h-100 border-0 shadow-sm rounded-3 p-3 bg-white d-flex flex-column justify-content-between job-card-item cursor-pointer"
      style={{ cursor: "pointer" }}
    >
      <div>
        {/* Phần 1: Header (Logo + Thông tin chính) */}
        <div className="d-flex align-items-center gap-3 mb-2 job-card-header">
          <img
            src={logoUrl}
            alt={companyName}
            className="rounded-3 border p-1 object-fit-contain flex-shrink-0"
            style={{ width: "64px", height: "64px" }}
            width="64"
            height="64"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (e.currentTarget.src !== defaultLogo) {
                e.currentTarget.src = defaultLogo;
              }
            }}
          />

          <div className="flex-grow-1 min-width-0 job-card-main-info">
            {job?.is_featured && (
              <span className="badge bg-warning text-dark fw-semibold rounded-pill mb-1 d-inline-block">
                <i className="bi bi-star-fill me-1"></i> Nổi bật
              </span>
            )}
            <h6 className="card-title mb-1 fw-bold text-truncate job-title-row">
              <Link
                to={`/jobs/${job?.id}`}
                className="text-decoration-none text-dark"
                title={job?.title}
              >
                {job?.title || "Tin tuyển dụng"}
              </Link>
            </h6>
            <p className="text-secondary small mb-0 text-truncate company-name-row">
              {companyName}
            </p>
          </div>
        </div>

        {/* Phần 2: Thông tin chi tiết (Badges) */}
        <div className="d-flex flex-wrap gap-1 my-2 job-details-row">
          <span className="badge bg-light text-secondary border fw-normal">
            <i className="bi bi-cash me-1"></i>
            {formatSalary()}
          </span>
          <span className="badge bg-light text-secondary border fw-normal">
            <i className="bi bi-geo-alt me-1"></i>
            {locationName}
          </span>
          <span className="badge bg-light text-secondary border fw-normal">
            <i className="bi bi-person me-1"></i>
            {ageRequirement}
          </span>
          <span className="badge bg-light text-secondary border fw-normal">
            <i className="bi bi-briefcase me-1"></i>
            {employmentTypeLabel}
          </span>
        </div>
      </div>

      {/* Phần 3: Chân thẻ (Nút bấm) */}
      <div className="d-flex justify-content-end align-items-center gap-2 mt-2 job-card-footer">
        <button
          type="button"
          onClick={() => onSave?.(job?.id)}
          className={`btn job-save-button ${isSaved ? "is-saved" : ""}`}
          title={isSaved ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          aria-label={isSaved ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <i className={`bi ${isSaved ? "bi-heart-fill" : "bi-heart"}`}></i>
        </button>

        <Link
          to={`/jobs/${job?.id}`}
          className="btn job-apply-button"
        >
          Ứng tuyển
        </Link>
      </div>
    </div>
  );
}