import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { fetchJobs, fetchSavedJobs, saveJob } from "../api/jobs";
import { fetchJobCategories, fetchLocations } from "../api/catalog";
import { useAuth } from "../store/AuthContext";
import JobCard from "../components/JobCard";
import './JobList.css';

// Hàm bóc tách dữ liệu linh hoạt cho mọi cấu trúc API (Axios, Fetch, Paginated results)
function responseItems(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.results)) return response.data.results;
  if (Array.isArray(response.results)) return response.results;
  return [];
}

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Backend Developer", slug: "backend" },
  { id: 2, name: "Frontend Developer", slug: "frontend" },
  { id: 3, name: "Fullstack Developer", slug: "fullstack" },
  { id: 8, name: "Mobile Developer", slug: "mobile" },
  { id: 4, name: "UI/UX Design", slug: "design" },
  { id: 6, name: "Tester / QC Intern", slug: "tester" },
  { id: 7, name: "Data Analyst", slug: "data" },
  { id: 5, name: "Marketing Intern", slug: "marketing" },
];

const FALLBACK_LOCATIONS = [
  { id: 1, name: "Hà Nội", slug: "ha-noi" },
  { id: 2, name: "TP. Hồ Chí Minh", slug: "tp-ho-chi-minh" },
  { id: 3, name: "Đà Nẵng", slug: "da-nang" },
  { id: 4, name: "Cần Thơ", slug: "can-tho" },
  { id: 5, name: "Hải Phòng", slug: "hai-phong" },
  { id: 6, name: "Bình Dương", slug: "binh-duong" },
  { id: 7, name: "Toàn quốc", slug: "toan-quoc" },
];

const SALARY_OPTIONS = [
  { value: "", label: "Tất cả mức lương" },
  { value: "under_3m", label: "Dưới 3 triệu / tháng" },
  { value: "3m_5m", label: "3 - 5 triệu / tháng" },
  { value: "5m_10m", label: "5 - 10 triệu / tháng" },
  { value: "over_10m", label: "Trên 10 triệu / tháng" },
  { value: "negotiable", label: "Thỏa thuận" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả hình thức" },
  { value: "full_time", label: "Full-time (Toàn thời gian)" },
  { value: "part_time", label: "Part-time (Bán thời gian)" },
  { value: "remote", label: "Remote (Làm từ xa)" },
  { value: "hybrid", label: "Hybrid (Linh hoạt)" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất (Mặc định)" },
  { value: "salary_desc", label: "Lương: Cao đến thấp" },
  { value: "salary_asc", label: "Lương: Thấp đến cao" },
  { value: "views", label: "Xem nhiều nhất" },
  { value: "deadline", label: "Hạn nộp gần nhất" },
];

/**
 * Component Dropdown tùy biến với Submenu Popup cao cấp chuẩn giao diện InternHub
 */
function FilterDropdown({
  id,
  label,
  icon,
  value,
  options,
  placeholder,
  onChange,
  isOpen,
  onToggle,
  onClose,
}) {
  const selectedOption = options.find(
    (opt) =>
      opt.value === value ||
      (value && opt.value && String(opt.value).toLowerCase() === String(value).toLowerCase())
  );
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isSelected = Boolean(value && value !== "all");

  return (
    <div className="job-filter-field position-relative" data-filter-id={id}>
      <label
        htmlFor={id}
        className="form-label small fw-bold text-secondary mb-1 d-flex align-items-center gap-1"
      >
        <i className={`bi ${icon} text-pink`} />
        {label}
      </label>

      <button
        type="button"
        id={id}
        onClick={onToggle}
        className={`job-filter-trigger w-100 d-flex align-items-center justify-content-between px-3 py-2 text-start ${isOpen ? "is-open" : ""
          } ${isSelected ? "has-value" : ""}`}
        aria-expanded={isOpen}
      >
        <span className={`text-truncate ${isSelected ? "fw-semibold text-dark" : "text-muted"}`}>
          {displayLabel}
        </span>
        <i
          className={`bi bi-chevron-down ms-2 small transition-transform ${isOpen ? "rotate-180 text-pink" : "text-muted"
            }`}
        />
      </button>

      {/* Submenu Dropdown Popup */}
      {isOpen && (
        <div className="job-filter-submenu position-absolute w-100">
          <div className="job-filter-submenu-list">
            {options.map((opt) => {
              const active =
                opt.value === value ||
                (!value && !opt.value) ||
                (value && opt.value && String(opt.value).toLowerCase() === String(value).toLowerCase());
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    onClose();
                  }}
                  className={`job-filter-submenu-item d-flex align-items-center justify-content-between ${active ? "is-active" : ""
                    }`}
                >
                  <span className="text-truncate">{opt.label}</span>
                  {active && <i className="bi bi-check2 text-pink fw-bold ms-2 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Tải danh sách việc làm đã lưu khi người dùng đăng nhập
  useEffect(() => {
    if (user?.id) {
      fetchSavedJobs()
        .then((res) => {
          const ids = res.data?.saved_job_ids || [];
          setSavedJobIds(ids);
        })
        .catch(() => { });
    } else {
      setSavedJobIds([]);
    }
  }, [user?.id]);

  const handleSaveJob = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await saveJob(jobId);
      if (res.data?.saved) {
        setSavedJobIds((prev) => [...prev, jobId]);
      } else {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      }
    } catch (err) {
      console.error("Lỗi khi lưu việc làm:", err);
    }
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".job-filter-field")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  // Tải danh mục vị trí và địa điểm từ API
  useEffect(() => {
    fetchJobCategories()
      .then((res) => {
        const items = responseItems(res);
        if (items.length > 0) setCategories(items);
      })
      .catch(() => { });

    fetchLocations()
      .then((res) => {
        const items = responseItems(res);
        if (items.length > 0) setLocations(items);
      })
      .catch(() => { });
  }, []);

  // Đọc bộ lọc hiện tại từ URL query params
  const rawKeyword = searchParams.get("keyword") || "";
  const rawCat = searchParams.get("cat") || searchParams.get("category") || searchParams.get("position") || "";
  const rawSalary = searchParams.get("salary") || searchParams.get("salary_range") || "";
  const rawLocation = searchParams.get("location") || "";
  const rawType = searchParams.get("internship_type") || "";
  const rawSort = searchParams.get("sort") || searchParams.get("ordering") || "newest";

  // Chuẩn hóa giá trị chọn để khớp với dropdown
  const currentCat = useMemo(() => {
    if (!rawCat) return "";
    const lower = rawCat.toLowerCase();
    const match = categories.find(
      (c) =>
        String(c.id) === lower ||
        (c.slug && c.slug.toLowerCase() === lower) ||
        (c.name && c.name.toLowerCase() === lower)
    );
    return match ? (match.slug || match.name) : rawCat;
  }, [rawCat, categories]);

  const currentLocation = useMemo(() => {
    if (!rawLocation) return "";
    const lower = rawLocation.toLowerCase();
    const match = locations.find(
      (l) =>
        String(l.id) === lower ||
        (l.slug && l.slug.toLowerCase() === lower) ||
        (l.name && l.name.toLowerCase() === lower)
    );
    return match ? (match.slug || match.name) : rawLocation;
  }, [rawLocation, locations]);

  // Cập nhật URL khi đổi bộ lọc
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Dọn dẹp các alias nếu có
    if (key === "cat") {
      next.delete("category");
      next.delete("position");
    }
    if (key === "salary") {
      next.delete("salary_range");
    }
    setSearchParams(next);
  };

  const removeFilter = (key) => {
    updateFilter(key, "");
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setOpenDropdown(null);
  };

  // Tải danh sách công việc mỗi khi URL thay đổi
  useEffect(() => {
    const params = {};
    const keyword = searchParams.get("keyword");
    const category = searchParams.get("cat") || searchParams.get("category") || searchParams.get("position");
    const salary = searchParams.get("salary") || searchParams.get("salary_range");
    const locList = searchParams.getAll("location");
    const internshipType = searchParams.get("internship_type");
    const sort = searchParams.get("sort") || searchParams.get("ordering");

    if (keyword) params.keyword = keyword;
    if (category && category !== "all") params.category = category;
    if (salary && salary !== "all") params.salary_range = salary;
    if (locList.length > 0) {
      const valid = locList.filter((l) => l && l !== "all");
      if (valid.length === 1) params.location = valid[0];
      else if (valid.length > 1) params.location = valid;
    }
    if (internshipType && internshipType !== "all") params.internship_type = internshipType;
    if (sort && sort !== "newest") params.sort = sort;

    setLoading(true);
    fetchJobs(params)
      .then((response) => {
        setJobs(responseItems(response));
        setError("");
      })
      .catch(() => {
        setJobs([]);
        setError("Không thể tải danh sách việc làm. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Kiểm tra có bộ lọc nào đang được kích hoạt không
  const hasActiveFilters = Boolean(
    rawKeyword ||
    rawCat ||
    rawSalary ||
    rawLocation ||
    rawType ||
    (rawSort && rawSort !== "newest")
  );

  // Lấy nhãn hiển thị cho active filters badge
  const activeCategoryLabel = useMemo(() => {
    if (!rawCat) return "";
    const match = categories.find(
      (c) =>
        String(c.id) === rawCat.toLowerCase() ||
        (c.slug && c.slug.toLowerCase() === rawCat.toLowerCase()) ||
        (c.name && c.name.toLowerCase() === rawCat.toLowerCase())
    );
    return match ? match.name : rawCat;
  }, [rawCat, categories]);

  const activeSalaryLabel = useMemo(() => {
    if (!rawSalary) return "";
    const match = SALARY_OPTIONS.find((s) => s.value === rawSalary);
    return match ? match.label : rawSalary;
  }, [rawSalary]);

  const activeLocationLabel = useMemo(() => {
    if (!rawLocation) return "";
    const match = locations.find(
      (l) =>
        String(l.id) === rawLocation.toLowerCase() ||
        (l.slug && l.slug.toLowerCase() === rawLocation.toLowerCase()) ||
        (l.name && l.name.toLowerCase() === rawLocation.toLowerCase())
    );
    return match ? match.name : rawLocation;
  }, [rawLocation, locations]);

  const activeTypeLabel = useMemo(() => {
    if (!rawType) return "";
    const match = TYPE_OPTIONS.find((t) => t.value === rawType);
    return match ? match.label : rawType;
  }, [rawType]);

  // Mảng tùy chọn cho dropdown vị trí
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Tất cả vị trí" },
      ...categories.map((cat) => ({
        value: cat.slug || cat.name,
        label: cat.name,
      })),
    ],
    [categories]
  );

  // Mảng tùy chọn cho dropdown địa điểm
  const locationOptions = useMemo(
    () => [
      { value: "", label: "Tất cả địa điểm" },
      ...locations.map((loc) => ({
        value: loc.slug || loc.name,
        label: loc.name,
      })),
    ],
    [locations]
  );

  return (
    <div className="job-list-page min-vh-100" style={{ background: "rgb(255, 247, 248)" }}>
      <div className="container job-list-container py-4">
        {/* Tiêu đề & Giới thiệu */}
        {/* <div className="job-list-heading mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">Tìm nơi bắt đầu sự nghiệp</h1>
            <p className="job-list-lead mb-0">
              Khám phá những cơ hội thực tập chất lượng, phù hợp với năng lực và mức lương mong muốn.
            </p>
            <div className="job-list-trust mt-3">
              <span><i className="bi bi-patch-check-fill text-pink" /> Tin tuyển dụng xác thực</span>
              <span><i className="bi bi-lightning-charge-fill text-pink" /> Cập nhật mỗi ngày</span>
              <span><i className="bi bi-shield-check text-pink" /> Doanh nghiệp uy tín</span>
            </div>
          </div>
          <div className="job-list-heading-mark d-none d-md-flex" aria-hidden="true">
            <i className="bi bi-briefcase-fill" />
          </div>
        </div> */}

        {/* Khung Bộ Lọc Dropdown Submenu Cao Cấp */}
        <div className="job-filter-card bg-white rounded-4 p-4 shadow-sm border mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <span className="job-filter-icon-badge">
                <i className="bi bi-sliders2 text-pink fs-5" />
              </span>
              <h2 className="h5 fw-bold mb-0 text-dark">Bộ lọc tuyển dụng</h2>
              {hasActiveFilters && (
                <span className="badge rounded-pill bg-pink-subtle text-pink px-2 py-1 small fw-semibold">
                  Đang lọc kết quả
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn btn-sm btn-outline-pink rounded-pill px-3 d-flex align-items-center gap-1"
              >
                <i className="bi bi-arrow-counterclockwise" />
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {/* Hàng các Dropdown lọc với Submenu Popup cao cấp */}
          <div className="row g-3">
            {/* 1. Lọc theo Mức lương */}
            <div className="col-12 col-md-6 col-lg-3">
              <FilterDropdown
                id="filter-salary"
                label="Mức lương"
                icon="bi-cash-stack"
                value={rawSalary}
                placeholder="Tất cả mức lương"
                options={SALARY_OPTIONS}
                onChange={(val) => updateFilter("salary", val)}
                isOpen={openDropdown === "salary"}
                onToggle={() => toggleDropdown("salary")}
                onClose={() => setOpenDropdown(null)}
              />
            </div>

            {/* 2. Lọc theo Địa điểm */}
            <div className="col-12 col-md-6 col-lg-3">
              <FilterDropdown
                id="filter-location"
                label="Địa điểm"
                icon="bi-geo-alt"
                value={currentLocation}
                placeholder="Tất cả địa điểm"
                options={locationOptions}
                onChange={(val) => updateFilter("location", val)}
                isOpen={openDropdown === "location"}
                onToggle={() => toggleDropdown("location")}
                onClose={() => setOpenDropdown(null)}
              />
            </div>

            {/* 3. Lọc theo Hình thức làm việc */}
            <div className="col-12 col-md-6 col-lg-3">
              <FilterDropdown
                id="filter-type"
                label="Hình thức"
                icon="bi-clock-history"
                value={rawType}
                placeholder="Tất cả hình thức"
                options={TYPE_OPTIONS}
                onChange={(val) => updateFilter("internship_type", val)}
                isOpen={openDropdown === "type"}
                onToggle={() => toggleDropdown("type")}
                onClose={() => setOpenDropdown(null)}
              />
            </div>

            {/* 4. Sắp xếp kết quả */}
            <div className="col-12 col-md-6 col-lg-3">
              <FilterDropdown
                id="filter-sort"
                label="Sắp xếp"
                icon="bi-arrow-down-up"
                value={rawSort}
                placeholder="Mới nhất (Mặc định)"
                options={SORT_OPTIONS}
                onChange={(val) => updateFilter("sort", val)}
                isOpen={openDropdown === "sort"}
                onToggle={() => toggleDropdown("sort")}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
          </div>

          {/* Thanh hiển thị các bộ lọc đang chọn (Active Filter Badges) */}
          {hasActiveFilters && (
            <div className="job-active-filters-row mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
              <span className="small text-muted fw-semibold">Đang áp dụng:</span>

              {rawKeyword && (
                <span className="job-active-badge">
                  <span>Từ khóa: &quot;{rawKeyword}&quot;</span>
                  <button type="button" onClick={() => removeFilter("keyword")} aria-label="Xóa từ khóa">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}

              {rawCat && (
                <span className="job-active-badge">
                  <span>Vị trí: {activeCategoryLabel}</span>
                  <button type="button" onClick={() => removeFilter("cat")} aria-label="Xóa vị trí">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}

              {rawSalary && (
                <span className="job-active-badge">
                  <span>Lương: {activeSalaryLabel}</span>
                  <button type="button" onClick={() => removeFilter("salary")} aria-label="Xóa mức lương">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}

              {rawLocation && (
                <span className="job-active-badge">
                  <span>Địa điểm: {activeLocationLabel}</span>
                  <button type="button" onClick={() => removeFilter("location")} aria-label="Xóa địa điểm">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}

              {rawType && (
                <span className="job-active-badge">
                  <span>Hình thức: {activeTypeLabel}</span>
                  <button type="button" onClick={() => removeFilter("internship_type")} aria-label="Xóa hình thức">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}

              {rawSort && rawSort !== "newest" && (
                <span className="job-active-badge">
                  <span>Sắp xếp: {SORT_OPTIONS.find((s) => s.value === rawSort)?.label || rawSort}</span>
                  <button type="button" onClick={() => removeFilter("sort")} aria-label="Mặc định sắp xếp">
                    <i className="bi bi-x" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tiêu đề danh sách kết quả */}
        <div className="job-results-heading mb-3">
          <div>
            <span className="job-filter-kicker">DANH SÁCH VIỆC LÀM</span>
            <h2 className="h4 mb-0">Cơ hội thực tập phù hợp</h2>
          </div>
          {!loading && !error && (
            <span className="job-results-count">
              <i className="bi bi-briefcase me-1" />
              {jobs.length} công việc
            </span>
          )}
        </div>

        {/* Trạng thái Loading */}
        {loading && (
          <div className="job-list-state">
            <div className="spinner-border text-pink" role="status" />
            <p className="mt-3 text-secondary fw-medium">Đang tìm những cơ hội phù hợp...</p>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {!loading && error && (
          <div className="job-list-state job-list-error">
            <i className="bi bi-exclamation-circle text-danger fs-1" />
            <p className="mt-3 text-danger fw-medium">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-sm btn-outline-pink mt-2 rounded-pill px-3"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Trạng thái Không có kết quả */}
        {!loading && !error && jobs.length === 0 && (
          <div className="job-list-state py-5">
            <div className="job-empty-icon mb-3">
              <i className="bi bi-search text-pink" style={{ fontSize: "2.5rem" }} />
            </div>
            <h3 className="h5 fw-bold text-dark mb-2">Không tìm thấy việc làm phù hợp</h3>
            <p className="text-muted mb-3" style={{ maxWidth: "450px" }}>
              Hãy thử nới lỏng bộ lọc, đổi vị trí làm việc hoặc chọn mức lương khác để khám phá thêm nhiều cơ hội.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn btn-pink rounded-pill px-4 py-2 text-white fw-bold shadow-sm"
              >
                <i className="bi bi-arrow-counterclockwise me-1" /> Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        )}

        {/* Danh sách Công việc */}
        {!loading && !error && jobs.length > 0 && (
          <div className="row g-3 job-grid">
            {jobs.map((job) => (
              <div key={job.id} className="col-12 col-md-6 col-lg-4">
                <JobCard
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobIds.includes(job.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}