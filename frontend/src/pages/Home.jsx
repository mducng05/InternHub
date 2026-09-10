import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { fetchSavedJobs, saveJob } from "../api/jobs";
import { useAuth } from "../store/AuthContext";
import JobCard from "../components/JobCard";
import HomeSearchBanner from "../components/HomeSearchBanner";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState({ ok: false, msg: "Đang kiểm tra kết nối backend..." });
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Kiểm tra trạng thái Server
    client
      .get("/health/")
      .then((res) => setStatus({ ok: true, msg: `Backend kết nối thành công (status: ${res.data.status})` }))
      .catch(() => setStatus({ ok: false, msg: "Không kết nối được với Backend Django" }));

    // 2. Lấy danh sách công việc thực tế từ Cơ sở dữ liệu (DB)
    setLoading(true);
    setError(null);

    client
      .get("/jobs/")
      .then((res) => {
        // Xử lý dữ liệu trả về từ DRF (nếu có phân trang results hoặc mảng trực tiếp)
        const jobList = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setJobs(jobList);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách công việc từ DB:", err);
        setError("Không thể tải dữ liệu việc làm từ cơ sở dữ liệu.");
        setJobs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Tải danh sách việc làm đã lưu khi người dùng đăng nhập
  useEffect(() => {
    if (user?.id) {
      fetchSavedJobs()
        .then((res) => {
          const ids = res.data?.saved_job_ids || [];
          setSavedJobIds(ids);
        })
        .catch(() => {});
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

  return (
    <div className="min-vh-100 pb-5" style={{ background: "#fff7f8" }}>
      <HomeSearchBanner />

      {/* THANH TRẠNG THÁI KẾT NỐI BACKEND */}
      {/* <div className="container mt-3">
        <div className={`alert ${status.ok ? "alert-pink" : "alert-warning"} d-flex align-items-center gap-2 py-2 px-3 rounded-3 small`}>
          <i className={`bi ${status.ok ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
          <span><strong>Trạng thái kết nối API:</strong> {status.msg}</span>
        </div>
      </div> */}

      {/* DANH SÁCH VIỆC LÀM TỪ DATABASE */}
      <main className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#800f2f" }}>Việc làm thực tập mới nhất</h4>
          </div>
          <Link to="/jobs" className="btn btn-outline-pink btn-sm rounded-pill px-3 fw-medium">
            Xem tất cả <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {/* Trạng thái 1: Đang tải dữ liệu từ DB */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-pink" role="status"></div>
            <p className="mt-2 text-muted small">Đang tải dữ liệu từ cơ sở dữ liệu...</p>
          </div>
        )}

        {/* Trạng thái 2: Lỗi API */}
        {!loading && error && (
          <div className="text-center py-5 text-danger">
            <i className="bi bi-exclamation-circle fs-1"></i>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {/* Trạng thái 3: DB trống (Chưa có tin tuyển dụng nào) */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-5 bg-light rounded-4 border">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <p className="mt-2 text-secondary mb-0">Hiện chưa có tin tuyển dụng nào trong cơ sở dữ liệu.</p>
          </div>
        )}

        {/* Trạng thái 4: Hiển thị dữ liệu DB thành công */}
        {!loading && !error && jobs.length > 0 && (
          <div className="row g-3">
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
      </main>

    </div>
  );
}