import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { fetchJobs } from "../api/jobs";
import JobCard from "../components/JobCard";
import HomeSearchBanner from "../components/HomeSearchBanner";

// Hàm bóc tách dữ liệu linh hoạt cho mọi cấu trúc API (Axios, Fetch, Paginated results)
function responseItems(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.results)) return response.data.results;
  if (Array.isArray(response.results)) return response.results;
  return [];
}

export default function JobList() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = {};
    const keyword = searchParams.get("keyword");
    const locations = searchParams.getAll("location");
    if (keyword) params.keyword = keyword;
    if (locations.length) params.location = locations;

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

  return (
    <div className="job-list-page min-vh-100">
      <HomeSearchBanner />
      <div className="container job-list-container">
        <div className="job-list-heading mb-4 mb-md-5">
          <div>
            <h1 className="display-6 fw-bold mb-2">Tìm nơi bắt đầu sự nghiệp</h1>
            <p className="job-list-lead mb-0">
              Khám phá những vị trí thực tập phù hợp với định hướng của bạn.
            </p>
            <div className="job-list-trust mt-3">
              <span><i className="bi bi-patch-check-fill" /> Tin tuyển dụng xác thực</span>
              <span><i className="bi bi-lightning-charge-fill" /> Cập nhật mỗi ngày</span>
            </div>
          </div>
          <div className="job-list-heading-mark d-none d-md-flex" aria-hidden="true">
            <i className="bi bi-briefcase-fill" />
          </div>
        </div>

        <div className="job-results-heading mb-3">
          <div>
            <span className="job-filter-kicker">DANH SÁCH GỢI Ý</span>
            <h2 className="h4 mb-0">Vị trí dành cho bạn</h2>
          </div>
          {!loading && !error && (
            <span className="job-results-count">{jobs.length} vị trí</span>
          )}
        </div>

        {loading && (
          <div className="job-list-state">
            <div className="spinner-border text-pink" role="status" />
            <p>Đang tìm những cơ hội phù hợp...</p>
          </div>
        )}
        {!loading && error && (
          <div className="job-list-state job-list-error">
            <i className="bi bi-exclamation-circle" />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && jobs.length === 0 && (
          <div className="job-list-state">
            <i className="bi bi-search" />
            <p>Không tìm thấy tin tuyển dụng phù hợp.</p>
          </div>
        )}
        {!loading && !error && jobs.length > 0 && (
          <div className="row g-3 job-grid">
            {jobs.map((job) => (
              <div key={job.id} className="col-12 col-md-6 col-lg-4">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}