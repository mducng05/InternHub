import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchJobs, fetchSavedJobs, saveJob } from "../api/jobs";
import { fetchMarketInsights } from "../api/guides";
import { useAuth } from "../store/AuthContext";
import JobCard from "../components/JobCard";
import HomeSearchBanner from "../components/HomeSearchBanner";
import "./Home.css";

const QUICK_GUIDES = [
  { icon: "bi-compass", title: "Chọn hướng nghề nghiệp", text: "Tìm lộ trình phù hợp với sở thích và kỹ năng.", to: "/guides?guide=career" },
  { icon: "bi-lightbulb", title: "Chuẩn bị hồ sơ", text: "Checklist từng bước trước khi ứng tuyển.", to: "/guides?guide=job-search" },
  { icon: "bi-chat-square-text", title: "Luyện phỏng vấn", text: "Xem câu hỏi và cách chuẩn bị câu trả lời.", to: "/interview-questions" },
];

function responseItems(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

function JobCardSkeleton() {
  return (
    <div className="home-job-skeleton" aria-hidden="true">
      <div className="home-skeleton-head"><span /><div><i /><i /></div></div>
      <i className="home-skeleton-line" />
      <i className="home-skeleton-line is-short" />
      <div className="home-skeleton-foot"><i /><i /></div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHomeData = async () => {
    setLoading(true);
    setError("");
    const [jobsResult, marketResult] = await Promise.allSettled([fetchJobs(), fetchMarketInsights()]);
    if (jobsResult.status === "fulfilled") {
      setJobs(responseItems(jobsResult.value.data));
    } else {
      setError("Chưa tải được danh sách việc làm. Kiểm tra kết nối rồi thử lại.");
    }
    if (marketResult.status === "fulfilled") setMarket(marketResult.value.data);
    setLoading(false);
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setSavedJobIds([]);
      return;
    }
    fetchSavedJobs()
      .then((response) => setSavedJobIds(response.data?.saved_job_ids || []))
      .catch(() => setSavedJobIds([]));
  }, [user?.id]);

  const categories = useMemo(() => {
    const seen = new Set();
    return jobs
      .map((job) => job.job_category)
      .filter((category) => category?.id && !seen.has(category.id) && seen.add(category.id))
      .slice(0, 6);
  }, [jobs]);

  const handleSaveJob = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const { data } = await saveJob(jobId);
      setSavedJobIds((current) => data.saved
        ? [...new Set([...current, jobId])]
        : current.filter((id) => id !== jobId));
    } catch {
      // The job card remains usable if saving is unavailable.
    }
  };

  const visibleJobs = [...jobs]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 6);

  return (
    <div className="home-page">
      <HomeSearchBanner />

      <main className="home-page__inner">
        <section className="home-welcome">
          <div>
            <span className="home-eyebrow">INTERNHUB · DÀNH CHO SINH VIÊN</span>
            <h1>Bước đầu sự nghiệp,<br /><em>bắt đầu từ đây.</em></h1>
            <p>Khám phá cơ hội thực tập phù hợp, chuẩn bị hồ sơ và tự tin ứng tuyển.</p>
          </div>
          <div className="home-welcome__actions">
            <Link className="home-primary-link" to="/jobs">Khám phá việc làm <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
            <Link className="home-secondary-link" to="/guides?guide=career">Tìm hướng nghề <i className="bi bi-compass" aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="home-market-strip" aria-label="Tổng quan cơ hội">
          <div><i className="bi bi-briefcase" aria-hidden="true" /><span><strong>{market ? market.total_jobs.toLocaleString("vi-VN") : "—"}</strong> tin đang tuyển</span></div>
          <div><i className="bi bi-person-workspace" aria-hidden="true" /><span><strong>{market ? market.total_openings.toLocaleString("vi-VN") : "—"}</strong> vị trí cần tuyển</span></div>
          <div><i className="bi bi-stars" aria-hidden="true" /><span><strong>{market ? market.recent_jobs_30_days.toLocaleString("vi-VN") : "—"}</strong> tin mới trong 30 ngày</span></div>
          <Link to="/guides?guide=market">Xem thị trường <i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
        </section>

        {categories.length > 0 && (
          <section className="home-category-section" aria-labelledby="home-category-title">
            <div className="home-section-heading home-section-heading--compact">
              <div><span className="home-eyebrow">TÌM THEO LĨNH VỰC</span><h2 id="home-category-title">Bạn muốn bắt đầu ở đâu?</h2></div>
            </div>
            <div className="home-category-list">
              {categories.map((category) => (
                <Link key={category.id} to={`/jobs?cat=${encodeURIComponent(category.name)}`}>
                  {category.name}<i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="home-content-grid">
          <section className="home-jobs-section" aria-labelledby="home-jobs-title">
            <div className="home-section-heading">
              <div><span className="home-eyebrow">CƠ HỘI MỚI</span><h2 id="home-jobs-title">Việc làm thực tập mới nhất</h2><p>Tin đã được duyệt và đang nhận hồ sơ.</p></div>
              <Link className="home-view-all" to="/jobs">Tất cả việc làm <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
            </div>

            {loading && (
              <div className="home-job-grid" aria-label="Đang tải danh sách việc làm">
                {Array.from({ length: 4 }, (_, index) => <JobCardSkeleton key={index} />)}
              </div>
            )}

            {!loading && error && (
              <div className="home-state home-state--error" role="alert">
                <i className="bi bi-cloud-slash" aria-hidden="true" /><p>{error}</p>
                <button onClick={loadHomeData} type="button">Thử tải lại</button>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="home-state">
                <i className="bi bi-inbox" aria-hidden="true" />
                <h3>Chưa có tin tuyển dụng phù hợp</h3>
                <p>Cơ hội mới sẽ xuất hiện ở đây khi doanh nghiệp đăng tuyển.</p>
                <Link to="/guides?guide=job-search">Xem checklist chuẩn bị hồ sơ <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
              </div>
            )}

            {!loading && !error && jobs.length > 0 && (
              <div className="home-job-grid">
                {visibleJobs.map((job) => (
                  <div key={job.id} className="home-job-cell">
                    <JobCard job={job} onSave={handleSaveJob} isSaved={savedJobIds.includes(job.id)} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="home-guidance" aria-labelledby="home-guidance-title">
            <span className="home-eyebrow">SẴN SÀNG ỨNG TUYỂN</span>
            <h2 id="home-guidance-title">Mỗi bước nhỏ đều đưa bạn tiến lên.</h2>
            <p>Chuẩn bị có định hướng giúp bạn tìm cơ hội phù hợp và kể câu chuyện của mình tốt hơn.</p>
            <div className="home-guidance-links">
              <Link to="/guides?guide=job-search"><i className="bi bi-list-check" aria-hidden="true" /><span><strong>Checklist tìm việc</strong><small>Theo dõi từng bước chuẩn bị</small></span><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
              <Link to="/interview-questions"><i className="bi bi-chat-square-text" aria-hidden="true" /><span><strong>Luyện phỏng vấn</strong><small>Câu hỏi và gợi ý trả lời</small></span><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
              <Link to="/tools?tool=personality"><i className="bi bi-compass" aria-hidden="true" /><span><strong>Khám phá thiên hướng</strong><small>Tìm nhóm nghề phù hợp</small></span><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
            </div>
            <div className="home-guidance-foot"><i className="bi bi-heart-pulse" aria-hidden="true" /> Bắt đầu với một việc nhỏ hôm nay.</div>
          </aside>
        </div>

        <section className="home-bottom-cta">
          <div><span className="home-eyebrow">CÔNG CỤ DÀNH CHO BẠN</span><h2>Hiểu mình hơn. Chuẩn bị tốt hơn.</h2><p>Trắc nghiệm nghề nghiệp, tính lương và kế hoạch tài chính trong một nơi.</p></div>
          <Link className="home-primary-link" to="/tools">Khám phá công cụ <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </section>
      </main>
    </div>
  );
}