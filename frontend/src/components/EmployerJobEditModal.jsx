import { useEffect, useState } from "react";

const JOB_TYPES = [
  ["full_time", "Toàn thời gian"],
  ["part_time", "Bán thời gian"],
  ["remote", "Làm từ xa"],
  ["hybrid", "Linh hoạt"],
];

function initialValues(job) {
  return {
    title: job.title || "",
    description: job.description || "",
    requirements: job.requirements || "",
    job_category: job.job_category || "",
    location: job.location || "",
    internship_type: job.internship_type || "full_time",
    deadline: job.deadline || "",
    salary_min: job.salary_min ?? "",
    salary_max: job.salary_max ?? "",
    is_salary_negotiable: Boolean(job.is_salary_negotiable),
  };
}

export default function EmployerJobEditModal({
  job,
  categories,
  locations,
  saving,
  error,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => initialValues(job));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, saving]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      job_category: form.job_category || null,
      location: form.location || null,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
    });
  };

  return (
    <div
      className="employer-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        aria-labelledby="employer-edit-title"
        aria-modal="true"
        className="employer-edit-modal"
        role="dialog"
      >
        <header className="employer-edit-modal__header">
          <div>
            <span className="employer-dashboard__eyebrow">CHỈNH SỬA NHANH</span>
            <h2 id="employer-edit-title">Cập nhật tin tuyển dụng</h2>
          </div>
          <button
            aria-label="Đóng cửa sổ chỉnh sửa"
            className="employer-icon-button"
            disabled={saving}
            onClick={onClose}
            title="Đóng"
            type="button"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <form className="employer-edit-form" onSubmit={handleSubmit}>
          <div className="employer-edit-modal__body">
            <label className="employer-field employer-field--wide">
              <span>Tên vị trí <b>*</b></span>
              <input autoFocus maxLength={255} name="title" onChange={handleChange} required value={form.title} />
            </label>

            <div className="employer-edit-form__grid">
              <label className="employer-field">
                <span>Danh mục</span>
                <select name="job_category" onChange={handleChange} value={form.job_category}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="employer-field">
                <span>Địa điểm</span>
                <select name="location" onChange={handleChange} value={form.location}>
                  <option value="">Chọn địa điểm</option>
                  {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="employer-field">
                <span>Hình thức</span>
                <select name="internship_type" onChange={handleChange} value={form.internship_type}>
                  {JOB_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="employer-field">
                <span>Hạn ứng tuyển <b>*</b></span>
                <input min={new Date().toISOString().slice(0, 10)} name="deadline" onChange={handleChange} required type="date" value={form.deadline} />
              </label>
              <label className="employer-field">
                <span>Lương tối thiểu (VNĐ/tháng)</span>
                <input min="0" name="salary_min" onChange={handleChange} type="number" value={form.salary_min} />
              </label>
              <label className="employer-field">
                <span>Lương tối đa (VNĐ/tháng)</span>
                <input min="0" name="salary_max" onChange={handleChange} type="number" value={form.salary_max} />
              </label>
            </div>

            <label className="employer-field">
              <span>Mô tả công việc <b>*</b></span>
              <textarea name="description" onChange={handleChange} required rows="5" value={form.description} />
            </label>
            <label className="employer-field">
              <span>Yêu cầu ứng viên</span>
              <textarea name="requirements" onChange={handleChange} rows="4" value={form.requirements} />
            </label>
            <label className="employer-checkbox">
              <input checked={form.is_salary_negotiable} name="is_salary_negotiable" onChange={handleChange} type="checkbox" />
              <span>Mức lương có thể thương lượng</span>
            </label>
            {error && <p className="employer-feedback is-error" role="alert">{error}</p>}
          </div>

          <footer className="employer-edit-modal__footer">
            <button className="employer-cancel-button" disabled={saving} onClick={onClose} type="button">Hủy</button>
            <button className="employer-submit" disabled={saving} type="submit">
              <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check2"}`} aria-hidden="true" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}