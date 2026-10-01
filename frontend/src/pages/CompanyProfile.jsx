import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import defaultLogo from "../assets/logo01.png";
import { fetchJobs } from "../api/jobs";
import { fetchPublicCompany } from "../api/profile";
import "./CompanyProfile.css";

function responseItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatSalary(job) {
  if (job.is_salary_negotiable || (job.salary_min == null && job.salary_max == null)) return "Thỏa thuận";
  const format = (value) => `${(value / 1000000).toLocaleString("vi-VN")} triệu`;
  if (job.salary_min != null && job.salary_max != null) return `${format(job.salary_min)} - ${format(job.salary_max)}`;
  return `${format(job.salary_min ?? job.salary_max)}`;
}

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([fetchPublicCompany(id), fetchJobs({ employer: id })])
      .then(([companyResponse, jobsResponse]) => {
        if (!active) return;
        setCompany(companyResponse.data);
        setJobs(responseItems(jobsResponse.data));
        setJobCount(jobsResponse.data?.count ?? responseItems(jobsResponse.data).length);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 404
          ? "Không tìm thấy trang doanh nghiệp này."
          : "Không thể tải thông tin doanh nghiệp. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <main className="company-page"><div className="company-page__state"><span className="company-spinner" />Đang tải trang doanh nghiệp...</div></main>;
  }

  if (error || !company) {
    return (
      <main className="company-page">
        <div className="company-page__state is-error">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          <p>{error || "Không tìm thấy doanh nghiệp."}</p>
          <Link to="/jobs">Quay lại tìm việc</Link>
        </div>
      </main>
    );
  }

  const companySize = company.company_size_display || company.company_size || "Chưa cập nhật";
  const industryName = company.industry?.name || "Chưa cập nhật";

  return (
    <main className="company-page">
      <div className="company-page__inner">
        <nav className="company-breadcrumb" aria-label="Breadcrumb">
          <Link to="/jobs">Việc làm</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <span>{company.company_name}</span>
        </nav>

        <header className="company-hero">
          <img
            alt={`${company.company_name} logo`}
            className="company-logo"
            onError={(event) => { event.currentTarget.src = defaultLogo; }}
            src={company.logo || defaultLogo}
          />
          <div className="company-hero__main">
            <div className="company-hero__title-row">
              <h1>{company.company_name}</h1>
              {company.is_verified && (
                <span className="company-verified"><i className="bi bi-patch-check-fill" aria-hidden="true" /> Đã xác minh</span>
              )}
            </div>
            <p>{industryName} <span aria-hidden="true">·</span> {companySize}</p>
            <div className="company-hero__links">
              {company.website && <a href={company.website} target="_blank" rel="noreferrer"><i className="bi bi-globe2" aria-hidden="true" /> Website công ty <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a>}
              {company.address && <span><i className="bi bi-geo-alt" aria-hidden="true" /> {company.address}</span>}
            </div>
          </div>
          <div className="company-openings-count"><strong>{jobCount}</strong><span>vị trí đang tuyển</span></div>
        </header>

        <div className="company-content">
          <section className="company-about" aria-labelledby="company-about-title">
            <div className="company-section-heading">
              <div>
                <span className="company-eyebrow">VỀ CHÚNG TÔI</span>
                <h2 id="company-about-title">Giới thiệu doanh nghiệp</h2>
              </div>
              <i className="bi bi-buildings" aria-hidden="true" />
            </div>
            <p className="company-description">{company.description || "Doanh nghiệp chưa cập nhật phần giới thiệu."}</p>
            <dl className="company-facts">
              <div><dt>Lĩnh vực</dt><dd>{industryName}</dd></div>
              <div><dt>Quy mô</dt><dd>{companySize}</dd></div>
              <div><dt>Địa chỉ</dt><dd>{company.address || "Chưa cập nhật"}</dd></div>
            </dl>
          </section>

          <section className="company-jobs" aria-labelledby="company-jobs-title">
            <div className="company-section-heading">
              <div>
                <span className="company-eyebrow">CƠ HỘI NGHỀ NGHIỆP</span>
                <h2 id="company-jobs-title">Vị trí đang tuyển <span>{jobCount}</span></h2>
              </div>
              <i className="bi bi-briefcase" aria-hidden="true" />
            </div>

            {jobs.length === 0 ? (
              <div className="company-jobs-empty"><i className="bi bi-inbox" aria-hidden="true" /><p>Hiện chưa có vị trí nào đang tuyển.</p></div>
            ) : (
              <div className="company-job-list">
                {jobs.map((job) => (
                  <Link className="company-job-row" key={job.id} to={`/jobs/${job.id}`}>
                    <div className="company-job-row__main">
                      <h3>{job.title}</h3>
                      <p>
                        {job.location?.name || "Toàn quốc"}
                        <span aria-hidden="true"> · </span>
                        {job.internship_type_display || job.internship_type}
                        <span aria-hidden="true"> · </span>
                        {formatSalary(job)}
                      </p>
                    </div>
                    <span className="company-job-link">Xem tin <i className="bi bi-arrow-up-right" aria-hidden="true" /></span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}