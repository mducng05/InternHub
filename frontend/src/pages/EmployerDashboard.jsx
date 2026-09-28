import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  closeEmployerJob,
  createEmployerJob,
  fetchEmployerJobApplications,
  fetchEmployerJobs,
  updateEmployerApplicationStatus,
  updateEmployerJob,
} from "../api/jobs";
import { fetchJobCategories, fetchLocations } from "../api/catalog";
import EmployerJobEditModal from "../components/EmployerJobEditModal";
import "./EmployerDashboard.css";

const JOB_TYPES = [
  ["full_time", "Toàn thời gian"],
  ["part_time", "Bán thời gian"],
  ["remote", "Làm từ xa"],
  ["hybrid", "Linh hoạt"],
];

const EXPERIENCE_LEVELS = [
  ["no_experience", "Không yêu cầu kinh nghiệm"],
  ["under_1_year", "Dưới 1 năm"],
  ["1_year", "1 năm"],
  ["2_years_plus", "Trên 2 năm"],
];

const ACADEMIC_YEARS = [
  ["year_2", "Năm 2"],
  ["year_3", "Năm 3"],
  ["year_4", "Năm 4"],
  ["graduated", "Đã tốt nghiệp"],
];

const JOB_STATUSES = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  approved: "Đang tuyển",
  rejected: "Bị từ chối",
  closed: "Đã đóng",
  expired: "Hết hạn",
};

const APPLICATION_STATUSES = {
  pending: "Mới ứng tuyển",
  shortlisted: "Đã chọn",
  interview_invited: "Mời phỏng vấn",
  accepted: "Được nhận",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

function dateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function emptyForm() {
  return {
    title: "",
    description: "",
    requirements: "",
    job_category: "",
    location: "",
    internship_type: "full_time",
    duration_months: "",
    salary_min: "",
    salary_max: "",
    is_salary_negotiable: false,
    experience_level: "no_experience",
    min_academic_year: "",
    num_positions: 1,
    deadline: dateAfterDays(30),
  };
}

function readItems(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function errorMessage(error) {
  const data = error.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (data && typeof data === "object") {
    return Object.values(data).flat().join(" ");
  }
  return "Không thể kết nối máy chủ. Vui lòng thử lại.";
}

function formatSalary(job) {
  if (job.is_salary_negotiable || (job.salary_min == null && job.salary_max == null)) {
    return "Thỏa thuận";
  }
  const format = (amount) => new Intl.NumberFormat("vi-VN").format(amount);
  if (job.salary_min != null && job.salary_max != null) {
    return `${format(job.salary_min)} - ${format(job.salary_max)} đ/tháng`;
  }
  return `${format(job.salary_min ?? job.salary_max)} đ/tháng`;
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [closingJobId, setClosingJobId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [openApplicantsJobId, setOpenApplicantsJobId] = useState(null);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loadingApplicantsJobId, setLoadingApplicantsJobId] = useState(null);
  const [applicantError, setApplicantError] = useState("");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  const loadDashboard = async () => {
    setLoading(true);
    setPageError("");
    const [jobsResult, categoriesResult, locationsResult] = await Promise.allSettled([
      fetchEmployerJobs(),
      fetchJobCategories(),
      fetchLocations(),
    ]);

    if (jobsResult.status === "fulfilled") {
      setJobs(jobsResult.value.data.results || []);
      setProfile(jobsResult.value.data.profile || null);
    } else {
      setPageError(errorMessage(jobsResult.reason));
    }
    if (categoriesResult.status === "fulfilled") setCategories(readItems(categoriesResult.value));
    if (locationsResult.status === "fulfilled") setLocations(readItems(locationsResult.value));
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    const payload = {
      ...form,
      job_category: form.job_category || null,
      location: form.location || null,
      duration_months: form.duration_months ? Number(form.duration_months) : null,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
      num_positions: Number(form.num_positions),
    };

    try {
      await createEmployerJob(payload);
      setForm(emptyForm());
      setSuccessMessage("Tin tuyển dụng đã được gửi và đang chờ quản trị viên duyệt.");
      await loadDashboard();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async (payload) => {
    setSavingEdit(true);
    setEditError("");
    try {
      const { data } = await updateEmployerJob(editingJob.id, payload);
      setJobs((current) => current.map((job) => job.id === editingJob.id ? data : job));
      const requiresReview = ["approved", "rejected"].includes(editingJob.status);
      setEditingJob(null);
      setActionError("");
      setActionMessage(requiresReview
        ? "Đã cập nhật tin. Tin được chuyển về trạng thái chờ duyệt."
        : "Đã cập nhật tin tuyển dụng.");
    } catch (error) {
      setEditError(errorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCloseJob = async (job) => {
    if (!window.confirm(`Đóng tin tuyển dụng “${job.title}”? Tin sẽ không còn hiển thị với ứng viên.`)) return;
    setClosingJobId(job.id);
    setActionMessage("");
    setActionError("");
    try {
      const { data } = await closeEmployerJob(job.id);
      setJobs((current) => current.map((item) => item.id === job.id ? { ...item, ...data } : item));
      setActionMessage(`Đã đóng tin “${job.title}”.`);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setClosingJobId(null);
    }
  };

  const handleToggleApplicants = async (job) => {
    if (openApplicantsJobId === job.id) {
      setOpenApplicantsJobId(null);
      return;
    }

    setOpenApplicantsJobId(job.id);
    setApplicantSearch("");
    setApplicantStatusFilter("all");
    await loadApplicants(job);
  };

  const loadApplicants = async (job) => {
    setApplicantError("");
    setLoadingApplicantsJobId(job.id);
    try {
      const { data } = await fetchEmployerJobApplications(job.id);
      setApplicantsByJob((current) => ({ ...current, [job.id]: data }));
    } catch (error) {
      setApplicantError(errorMessage(error));
    } finally {
      setLoadingApplicantsJobId(null);
    }
  };

  const handleApplicantStatusChange = async (job, applicant, nextStatus) => {
    setUpdatingApplicationId(applicant.id);
    setApplicantError("");
    try {
      const { data } = await updateEmployerApplicationStatus(job.id, applicant.id, { status: nextStatus });
      setApplicantsByJob((current) => {
        const jobData = current[job.id];
        if (!jobData) return current;
        return {
          ...current,
          [job.id]: {
            ...jobData,
            results: jobData.results.map((item) => item.id === applicant.id ? { ...item, ...data } : item),
          },
        };
      });
      setJobs((current) => current.map((item) => {
        if (item.id !== job.id || applicant.status === data.status) return item;
        const wasPending = applicant.status === "pending";
        const isPending = data.status === "pending";
        return {
          ...item,
          pending_application_count: Math.max(
            0,
            (item.pending_application_count || 0) + Number(isPending) - Number(wasPending),
          ),
        };
      }));
    } catch (error) {
      setApplicantError(errorMessage(error));
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const pendingCount = jobs.filter((job) => job.status === "pending").length;
  const activeCount = jobs.filter((job) => job.status === "approved").length;
  const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
  const totalApplications = jobs.reduce((sum, job) => sum + (job.application_count || 0), 0);
  const pendingApplications = jobs.reduce((sum, job) => sum + (job.pending_application_count || 0), 0);
  const interviewApplications = jobs.reduce((sum, job) => sum + (job.interview_application_count || 0), 0);
  const closedCount = jobs.filter((job) => job.status === "closed").length;
  const visibleJobs = jobs.filter((job) => {
    const matchesStatus = jobStatusFilter === "all" || job.status === jobStatusFilter;
    const matchesSearch = !jobSearch.trim() || job.title.toLocaleLowerCase("vi-VN").includes(jobSearch.trim().toLocaleLowerCase("vi-VN"));
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="employer-dashboard">
      <div className="employer-dashboard__inner">
        <header className="employer-dashboard__header">
          <div>
            <span className="employer-dashboard__eyebrow">KHU VỰC DOANH NGHIỆP</span>
            <h1>Quản lý tuyển dụng</h1>
            <p>Theo dõi tin đăng và tìm những thực tập sinh phù hợp.</p>
          </div>
          <div className={`employer-verification ${profile?.is_verified ? "is-verified" : "is-unverified"}`}>
            <i className={`bi ${profile?.is_verified ? "bi-patch-check-fill" : "bi-hourglass-split"}`} aria-hidden="true" />
            {profile?.is_verified ? "Doanh nghiệp đã xác minh" : "Doanh nghiệp chưa xác minh"}
          </div>
        </header>

        <section className="employer-metrics" aria-label="Thống kê tuyển dụng">
          <div><span>Tổng tin đăng</span><strong>{jobs.length}</strong></div>
          <div><span>Đang chờ duyệt</span><strong>{pendingCount}</strong></div>
          <div><span>Đang tuyển</span><strong>{activeCount}</strong></div>
          <div><span>Đã đóng</span><strong>{closedCount}</strong></div>
          <div><span>Tổng hồ sơ</span><strong>{totalApplications}</strong></div>
          <div><span>Hồ sơ mới</span><strong>{pendingApplications}</strong></div>
          <div><span>Mời phỏng vấn</span><strong>{interviewApplications}</strong></div>
          <div><span>Lượt xem</span><strong>{totalViews.toLocaleString("vi-VN")}</strong></div>
        </section>

        {!profile?.is_verified && profile && (
          <div className="employer-notice" role="status">
            <i className="bi bi-info-circle" aria-hidden="true" />
            Tin đăng của doanh nghiệp chưa xác minh sẽ được chuyển đến quản trị viên để duyệt trước khi hiển thị.
          </div>
        )}

        <div className="employer-workspace">
          <section className="employer-form-section" aria-labelledby="employer-form-title">
            <div className="employer-section-heading">
              <div>
                <span className="employer-dashboard__eyebrow">TIN TUYỂN DỤNG MỚI</span>
                <h2 id="employer-form-title">Thêm vị trí cần tuyển</h2>
              </div>
              <i className="bi bi-file-earmark-plus" aria-hidden="true" />
            </div>

            <form className="employer-job-form" onSubmit={handleSubmit}>
              <label className="employer-field employer-field--wide">
                <span>Tên vị trí <b>*</b></span>
                <input name="title" value={form.title} onChange={handleChange} maxLength={255} required placeholder="Ví dụ: Thực tập sinh Backend" />
              </label>

              <label className="employer-field">
                <span>Danh mục công việc</span>
                <select name="job_category" value={form.job_category} onChange={handleChange}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="employer-field">
                <span>Địa điểm</span>
                <select name="location" value={form.location} onChange={handleChange}>
                  <option value="">Chọn địa điểm</option>
                  {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="employer-field">
                <span>Hình thức</span>
                <select name="internship_type" value={form.internship_type} onChange={handleChange}>
                  {JOB_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="employer-field">
                <span>Kinh nghiệm</span>
                <select name="experience_level" value={form.experience_level} onChange={handleChange}>
                  {EXPERIENCE_LEVELS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="employer-field employer-field--wide">
                <span>Mô tả công việc <b>*</b></span>
                <textarea name="description" value={form.description} onChange={handleChange} rows="5" required placeholder="Mô tả công việc và trách nhiệm chính" />
              </label>

              <label className="employer-field employer-field--wide">
                <span>Yêu cầu ứng viên</span>
                <textarea name="requirements" value={form.requirements} onChange={handleChange} rows="4" placeholder="Kỹ năng, kiến thức hoặc yêu cầu khác" />
              </label>

              <label className="employer-field">
                <span>Lương tối thiểu (VNĐ/tháng)</span>
                <input name="salary_min" type="number" min="0" value={form.salary_min} onChange={handleChange} placeholder="3000000" />
              </label>

              <label className="employer-field">
                <span>Lương tối đa (VNĐ/tháng)</span>
                <input name="salary_max" type="number" min="0" value={form.salary_max} onChange={handleChange} placeholder="5000000" />
              </label>

              <label className="employer-field">
                <span>Số lượng tuyển</span>
                <input name="num_positions" type="number" min="1" value={form.num_positions} onChange={handleChange} required />
              </label>

              <label className="employer-field">
                <span>Hạn ứng tuyển <b>*</b></span>
                <input name="deadline" type="date" min={dateAfterDays(0)} value={form.deadline} onChange={handleChange} required />
              </label>

              <label className="employer-field">
                <span>Thời lượng thực tập (tháng)</span>
                <input name="duration_months" type="number" min="1" value={form.duration_months} onChange={handleChange} placeholder="3" />
              </label>

              <label className="employer-field">
                <span>Năm học tối thiểu</span>
                <select name="min_academic_year" value={form.min_academic_year} onChange={handleChange}>
                  <option value="">Không yêu cầu</option>
                  {ACADEMIC_YEARS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="employer-checkbox employer-field--wide">
                <input name="is_salary_negotiable" type="checkbox" checked={form.is_salary_negotiable} onChange={handleChange} />
                <span>Mức lương có thể thương lượng</span>
              </label>

              {formError && <p className="employer-feedback is-error employer-field--wide" role="alert">{formError}</p>}
              {successMessage && <p className="employer-feedback is-success employer-field--wide" role="status">{successMessage}</p>}

              <div className="employer-form-actions employer-field--wide">
                <button type="submit" className="employer-submit" disabled={submitting}>
                  <i className={`bi ${submitting ? "bi-arrow-repeat" : "bi-plus-lg"}`} aria-hidden="true" />
                  {submitting ? "Đang gửi..." : "Đăng tin tuyển dụng"}
                </button>
              </div>
            </form>
          </section>

          <section className="employer-list-section" aria-labelledby="employer-jobs-title">
            <div className="employer-section-heading">
              <div>
                <span className="employer-dashboard__eyebrow">DOANH NGHIỆP · {profile?.company_name || "TÀI KHOẢN CỦA BẠN"}</span>
                <h2 id="employer-jobs-title">Tin đã đăng <span>{jobs.length}</span></h2>
              </div>
              <i className="bi bi-briefcase" aria-hidden="true" />
            </div>
            {(actionMessage || actionError) && (
              <p className={`employer-feedback employer-list-feedback ${actionError ? "is-error" : "is-success"}`} role={actionError ? "alert" : "status"}>
                {actionError || actionMessage}
              </p>
            )}
            {!pageError && !loading && jobs.length > 0 && (
              <div className="employer-job-tools">
                <label className="employer-job-search">
                  <i className="bi bi-search" aria-hidden="true" />
                  <input
                    aria-label="Tìm tin tuyển dụng"
                    onChange={(event) => setJobSearch(event.target.value)}
                    placeholder="Tìm theo tên vị trí..."
                    type="search"
                    value={jobSearch}
                  />
                </label>
                <label className="employer-job-filter">
                  <span className="visually-hidden">Lọc trạng thái tin tuyển dụng</span>
                  <select onChange={(event) => setJobStatusFilter(event.target.value)} value={jobStatusFilter}>
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(JOB_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
            )}

            {pageError ? (
              <div className="employer-list-state is-error" role="alert">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                <p>{pageError}</p>
                <button type="button" onClick={loadDashboard}>Thử tải lại</button>
              </div>
            ) : loading ? (
              <div className="employer-list-state"><span className="employer-spinner" />Đang tải tin tuyển dụng...</div>
            ) : jobs.length === 0 ? (
              <div className="employer-list-state">
                <i className="bi bi-inbox" aria-hidden="true" />
                <p>Chưa có tin tuyển dụng nào.</p>
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="employer-list-state">
                <i className="bi bi-search" aria-hidden="true" />
                <p>Không có tin phù hợp với tìm kiếm hoặc bộ lọc.</p>
              </div>
            ) : (
              <div className="employer-job-list">
                {visibleJobs.map((job) => {
                  const applicantData = applicantsByJob[job.id];
                  const applicantsOpen = openApplicantsJobId === job.id;
                  const normalizedSearch = applicantSearch.trim().toLocaleLowerCase("vi-VN");
                  const visibleApplicants = (applicantData?.results || []).filter((applicant) => {
                    const matchesStatus = applicantStatusFilter === "all" || applicant.status === applicantStatusFilter;
                    const searchable = [applicant.full_name, applicant.email, applicant.phone, applicant.university, applicant.major]
                      .filter(Boolean)
                      .join(" ")
                      .toLocaleLowerCase("vi-VN");
                    return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
                  });
                  return (
                    <div className="employer-job-entry" key={job.id}>
                      <article className="employer-job-row">
                        <div className="employer-job-row__main">
                          <h3>{job.title}</h3>
                          <p>{[job.job_category_name, job.location_name, formatSalary(job)].filter(Boolean).join(" · ")}</p>
                          <span className="employer-job-row__meta">
                            <i className="bi bi-eye" aria-hidden="true" /> {job.views_count || 0} lượt xem
                            <span aria-hidden="true">·</span>
                            Hạn {new Date(`${job.deadline}T00:00:00`).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="employer-job-row__actions">
                          <span className={`employer-job-status status-${job.status}`}>
                            {job.status_display || JOB_STATUSES[job.status] || job.status}
                          </span>
                          <div className="employer-job-row__buttons">
                            <Link
                              aria-label={`Xem trước tin ${job.title}`}
                              className="employer-icon-button"
                              rel="noreferrer"
                              target="_blank"
                              title="Xem trước tin"
                              to={`/jobs/${job.id}`}
                            >
                              <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                            </Link>
                            <button
                              aria-expanded={applicantsOpen}
                              className={`employer-applicants-button ${applicantsOpen ? "is-open" : ""}`}
                              onClick={() => handleToggleApplicants(job)}
                              type="button"
                            >
                              <i className="bi bi-people" aria-hidden="true" />
                              Ứng viên · {job.application_count || applicantData?.count || 0}
                            </button>
                            <button
                              aria-label={`Sửa tin ${job.title}`}
                              className="employer-icon-button"
                              onClick={() => { setEditingJob(job); setEditError(""); }}
                              title="Sửa tin"
                              type="button"
                            >
                              <i className="bi bi-pencil" aria-hidden="true" />
                            </button>
                            {job.status !== "closed" && (
                              <button
                                aria-label={`Đóng tin ${job.title}`}
                                className="employer-icon-button employer-icon-button--danger"
                                disabled={closingJobId === job.id}
                                onClick={() => handleCloseJob(job)}
                                title="Đóng tin"
                                type="button"
                              >
                                <i className={`bi ${closingJobId === job.id ? "bi-arrow-repeat" : "bi-x-circle"}`} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>

                      {applicantsOpen && (
                        <section className="employer-applicants-panel" aria-label={`Ứng viên cho ${job.title}`}>
                          <div className="employer-applicants-panel__heading">
                            <h3>Hồ sơ ứng tuyển</h3>
                            {applicantData && (
                              <span>
                                {applicantData.count} hồ sơ · {applicantData.results.filter((item) => item.status === "pending").length} mới
                              </span>
                            )}
                          </div>
                          {applicantData && applicantData.count > 0 && (
                            <div className="employer-applicant-tools">
                              <label className="employer-applicant-search">
                                <i className="bi bi-search" aria-hidden="true" />
                                <input
                                  aria-label="Tìm ứng viên"
                                  onChange={(event) => setApplicantSearch(event.target.value)}
                                  placeholder="Tìm tên, email, trường..."
                                  type="search"
                                  value={applicantSearch}
                                />
                              </label>
                              <label className="employer-applicant-filter">
                                <span className="visually-hidden">Lọc trạng thái hồ sơ</span>
                                <select onChange={(event) => setApplicantStatusFilter(event.target.value)} value={applicantStatusFilter}>
                                  <option value="all">Tất cả trạng thái</option>
                                  {Object.entries(APPLICATION_STATUSES).filter(([value]) => value !== "cancelled").map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                  <option value="cancelled">Đã hủy</option>
                                </select>
                              </label>
                            </div>
                          )}
                          {loadingApplicantsJobId === job.id ? (
                            <div className="employer-list-state"><span className="employer-spinner" />Đang tải hồ sơ...</div>
                          ) : applicantError ? (
                            <div className="employer-applicant-error" role="alert">
                              <span>{applicantError}</span>
                              <button type="button" onClick={() => loadApplicants(job)}>Thử lại</button>
                            </div>
                          ) : !applicantData?.results?.length ? (
                            <div className="employer-applicants-empty">Chưa có ứng viên cho vị trí này.</div>
                          ) : visibleApplicants.length === 0 ? (
                            <div className="employer-applicants-empty">Không có hồ sơ khớp với tìm kiếm hoặc bộ lọc.</div>
                          ) : (
                            <div className="employer-applicant-list">
                              {visibleApplicants.map((applicant) => (
                                <article className="employer-applicant" key={applicant.id}>
                                  <div className="employer-applicant__topline">
                                    <div>
                                      <h4>{applicant.full_name}</h4>
                                      <p>{[applicant.university, applicant.major, applicant.graduation_year].filter(Boolean).join(" · ") || "Chưa cập nhật học vấn"}</p>
                                    </div>
                                    <span className={`employer-application-status status-${applicant.status}`}>
                                      {applicant.status_display || APPLICATION_STATUSES[applicant.status] || applicant.status}
                                    </span>
                                  </div>
                                  <div className="employer-applicant__details">
                                    <a href={`mailto:${applicant.email}`}><i className="bi bi-envelope" aria-hidden="true" />{applicant.email}</a>
                                    {applicant.phone && <a href={`tel:${applicant.phone}`}><i className="bi bi-telephone" aria-hidden="true" />{applicant.phone}</a>}
                                    <span><i className="bi bi-clock" aria-hidden="true" />Ứng tuyển {new Date(applicant.applied_at).toLocaleDateString("vi-VN")}</span>
                                  </div>
                                  <Link className="btn btn-sm btn-outline-danger rounded-pill mt-2" to={`/chat?application_id=${applicant.id}`}>
                                    <i className="bi bi-chat-dots me-1" /> Nhắn tin ứng viên
                                  </Link>
                                  {applicant.cover_letter && <p className="employer-applicant__letter">{applicant.cover_letter}</p>}
                                  {applicant.cv_url && (
                                    <a className="employer-cv-link" href={applicant.cv_url} rel="noreferrer" target="_blank">
                                      <i className="bi bi-file-earmark-person" aria-hidden="true" /> Xem CV
                                    </a>
                                  )}
                                  {applicant.status !== "cancelled" && (
                                    <div className="employer-applicant-actions">
                                      <label>
                                        <span>Cập nhật hồ sơ</span>
                                        <select
                                          aria-label={`Cập nhật trạng thái hồ sơ của ${applicant.full_name}`}
                                          disabled={updatingApplicationId === applicant.id}
                                          onChange={(event) => handleApplicantStatusChange(job, applicant, event.target.value)}
                                          value={applicant.status}
                                        >
                                          {Object.entries(APPLICATION_STATUSES)
                                            .filter(([value]) => value !== "cancelled")
                                            .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                      </label>
                                      {updatingApplicationId === applicant.id && <span className="employer-applicant-saving">Đang lưu...</span>}
                                    </div>
                                  )}
                                </article>
                              ))}
                            </div>
                          )}
                        </section>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
      {editingJob && (
        <EmployerJobEditModal
          categories={categories}
          error={editError}
          job={editingJob}
          locations={locations}
          onClose={() => setEditingJob(null)}
          onSave={handleEditSave}
          saving={savingEdit}
        />
      )}
    </main>
  );
}
