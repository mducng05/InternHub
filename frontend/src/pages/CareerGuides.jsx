import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchMarketInsights } from "../api/guides";
import { CAREER_PATHS, JOB_SEARCH_CHECKLIST } from "../data/careerGuidesData";
import "./CareerGuides.css";

const GUIDE_TABS = [
  { id: "career", title: "Định hướng nghề nghiệp", icon: "bi-compass" },
  { id: "job-search", title: "Bí quyết tìm việc", icon: "bi-lightbulb" },
  { id: "cv", title: "Hướng dẫn viết CV", icon: "bi-file-earmark-text" },
  { id: "market", title: "Thị trường & xu hướng", icon: "bi-graph-up" },
];

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem("career_guide_checklist") || "{}");
  } catch {
    return {};
  }
}

function number(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function money(value) {
  return `${number(value)} đ`;
}

function relativeDate(value) {
  if (!value) return "chưa rõ thời điểm";
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

export default function CareerGuides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGuide = searchParams.get("guide");
  const activeGuide = GUIDE_TABS.some((guide) => guide.id === requestedGuide) ? requestedGuide : "career";
  const [selectedPathId, setSelectedPathId] = useState(CAREER_PATHS[0].id);
  const [stage, setStage] = useState("student");
  const [checklist, setChecklist] = useState(loadChecklist);
  const [market, setMarket] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");

  const selectedPath = CAREER_PATHS.find((path) => path.id === selectedPathId) || CAREER_PATHS[0];
  const completedCount = JOB_SEARCH_CHECKLIST.filter((item) => checklist[item.id]).length;
  const completion = Math.round((completedCount / JOB_SEARCH_CHECKLIST.length) * 100);

  useEffect(() => {
    localStorage.setItem("career_guide_checklist", JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    if (activeGuide !== "market") return;
    let active = true;
    setMarketLoading(true);
    setMarketError("");
    fetchMarketInsights()
      .then(({ data }) => active && setMarket(data))
      .catch(() => active && setMarketError("Không tải được số liệu thị trường. Thử tải lại để kiểm tra kết nối."))
      .finally(() => active && setMarketLoading(false));
    return () => { active = false; };
  }, [activeGuide]);

  const sortedCategories = useMemo(
    () => [...(market?.top_categories || [])].sort((left, right) => right.jobs_count - left.jobs_count),
    [market],
  );
  const sortedLocations = useMemo(
    () => [...(market?.top_locations || [])].sort((left, right) => right.jobs_count - left.jobs_count),
    [market],
  );
  const maxCategoryCount = Math.max(1, ...sortedCategories.map((item) => item.jobs_count));
  const maxLocationCount = Math.max(1, ...sortedLocations.map((item) => item.jobs_count));

  const changeGuide = (guideId) => {
    setSearchParams({ guide: guideId });
  };

  const toggleChecklist = (itemId) => {
    setChecklist((current) => ({ ...current, [itemId]: !current[itemId] }));
  };

  const refreshMarket = async () => {
    setMarketLoading(true);
    setMarketError("");
    try {
      const { data } = await fetchMarketInsights();
      setMarket(data);
    } catch {
      setMarketError("Không tải được số liệu thị trường. Thử lại sau.");
    } finally {
      setMarketLoading(false);
    }
  };

  return (
    <main className="career-guides-page">
      <div className="career-guides-page__inner">
        <header className="career-guides-header">
          <div>
            <span className="career-guides-eyebrow">INTERNHUB · CẨM NANG</span>
            <h1>Chủ động cho bước tiếp theo</h1>
            <p>Chọn hướng đi, chuẩn bị hồ sơ và nhìn thị trường qua dữ liệu tuyển dụng thực tế.</p>
          </div>
          <Link className="career-guides-tools-link" to="/tools">
            <i className="bi bi-grid" aria-hidden="true" /> Mở bộ công cụ
            <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </Link>
        </header>

        <nav className="career-guides-tabs" aria-label="Chọn cẩm nang">
          {GUIDE_TABS.map((guide) => (
            <button className={activeGuide === guide.id ? "is-active" : ""} key={guide.id} onClick={() => changeGuide(guide.id)} type="button">
              <i className={`bi ${guide.icon}`} aria-hidden="true" />{guide.title}
            </button>
          ))}
        </nav>

        {activeGuide === "career" && (
          <section className="career-guide-section">
            <div className="career-guide-intro">
              <span className="career-guides-eyebrow">BẮT ĐẦU TỪ SỰ PHÙ HỢP</span>
              <h2>Định hướng nghề nghiệp</h2>
              <p>Chọn lĩnh vực khiến bạn tò mò. Xem kỹ năng thường dùng và một bước nhỏ để tự kiểm chứng mức độ phù hợp.</p>
            </div>
            <div className="career-path-layout">
              <div className="career-path-list" role="list" aria-label="Các hướng nghề nghiệp">
                {CAREER_PATHS.map((path) => (
                  <button
                    aria-pressed={path.id === selectedPathId}
                    className={`career-path-option ${path.id === selectedPathId ? "is-selected" : ""}`}
                    key={path.id}
                    onClick={() => setSelectedPathId(path.id)}
                    type="button"
                  >
                    <i className={`bi ${path.icon}`} aria-hidden="true" />
                    <span>{path.title}</span>
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <article className="career-path-detail">
                <div className="career-path-detail__title">
                  <span className="career-path-icon"><i className={`bi ${selectedPath.icon}`} aria-hidden="true" /></span>
                  <div><span className="career-guides-eyebrow">NHÓM NGHỀ</span><h3>{selectedPath.title}</h3></div>
                </div>
                <p>{selectedPath.summary}</p>
                <div className="career-path-skills">
                  <h4>Kỹ năng nên xây dựng</h4>
                  <div>{selectedPath.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
                <label className="career-stage-select">
                  <span>Bạn đang ở giai đoạn</span>
                  <select onChange={(event) => setStage(event.target.value)} value={stage}>
                    <option value="student">Đang học / tìm thực tập</option>
                    <option value="graduate">Mới tốt nghiệp / tìm việc đầu tiên</option>
                    <option value="switch">Đang cân nhắc chuyển hướng</option>
                  </select>
                </label>
                <div className="career-first-steps">
                  <h4>{stage === "student" ? "Bước tiếp theo trong 2 tuần" : stage === "graduate" ? "Bước tiếp theo trong 30 ngày" : "Bước thử nghiệm trước khi chuyển hướng"}</h4>
                  <ol>{selectedPath.firstSteps.map((step) => <li key={step}>{step}</li>)}</ol>
                </div>
                <Link className="career-guide-primary" to={`/jobs?cat=${encodeURIComponent(selectedPath.category)}`}>
                  Xem việc làm liên quan <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </article>
            </div>
          </section>
        )}

        {activeGuide === "job-search" && (
          <section className="career-guide-section">
            <div className="career-guide-intro career-checklist-intro">
              <div>
                <span className="career-guides-eyebrow">TỪ CHUẨN BỊ ĐẾN ỨNG TUYỂN</span>
                <h2>Bí quyết tìm việc</h2>
                <p>Một checklist có thể đánh dấu và tiếp tục sau khi quay lại trang này.</p>
              </div>
              <div className="career-checklist-progress"><strong>{completion}%</strong><span>{completedCount}/{JOB_SEARCH_CHECKLIST.length} việc đã xong</span><div><i style={{ width: `${completion}%` }} /></div></div>
            </div>
            <div className="career-checklist">
              {JOB_SEARCH_CHECKLIST.map((item, index) => (
                <article className={`career-checklist-item ${checklist[item.id] ? "is-complete" : ""}`} key={item.id}>
                  <button aria-checked={Boolean(checklist[item.id])} aria-label={`${checklist[item.id] ? "Bỏ hoàn thành" : "Đánh dấu hoàn thành"}: ${item.title}`} className="career-check-toggle" onClick={() => toggleChecklist(item.id)} role="checkbox" type="button">
                    <i className={`bi ${checklist[item.id] ? "bi-check-lg" : ""}`} aria-hidden="true" />
                  </button>
                  <span className="career-check-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="career-check-content"><h3>{item.title}</h3><p>{item.detail}</p></div>
                  <Link aria-label={item.linkLabel} className="career-check-link" to={item.link} title={item.linkLabel}><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
            <div className="career-checklist-footer"><button className="career-guide-secondary" onClick={() => setChecklist({})} type="button">Đặt lại checklist</button><Link className="career-guide-primary" to="/jobs">Bắt đầu tìm việc <i className="bi bi-arrow-right" aria-hidden="true" /></Link></div>
          </section>
        )}

        {activeGuide === "cv" && (
          <section className="career-guide-section">
            <div className="career-guide-intro">
              <span className="career-guides-eyebrow">CV RÕ RÀNG · ĐÚNG TRỌNG TÂM</span>
              <h2>Hướng dẫn viết CV</h2>
              <p>Giúp nhà tuyển dụng nhanh chóng hiểu bạn phù hợp vị trí nào và đã tạo ra kết quả gì.</p>
            </div>
            <div className="cv-guide-layout">
              <div className="cv-guide-main">
                <div className="cv-guide-steps">
                  {[
                    ["01", "Đọc kỹ mô tả", "Gạch ra 3-5 yêu cầu cốt lõi và dùng chúng để chọn thông tin liên quan."],
                    ["02", "Đưa bằng chứng lên trước", "Ưu tiên dự án, môn học, hoạt động hoặc công việc gần với vị trí mục tiêu."],
                    ["03", "Viết theo hành động và kết quả", "Nêu bạn đã làm gì, dùng cách nào và kết quả có thể kiểm chứng."],
                    ["04", "Rà soát trước khi gửi", "Kiểm tra lỗi chính tả, liên kết, thông tin liên hệ và tên file."],
                  ].map(([numberValue, title, description]) => (
                    <article className="cv-guide-step" key={numberValue}>
                      <span>{numberValue}</span><div><h3>{title}</h3><p>{description}</p></div>
                    </article>
                  ))}
                </div>

                <section className="cv-guide-example">
                  <div className="cv-guide-example__heading"><i className="bi bi-pencil-square" aria-hidden="true" /><h3>Viết gạch đầu dòng có thông tin</h3></div>
                  <div className="cv-guide-example__columns">
                    <div><span>Chung chung</span><p>Tham gia làm website cho câu lạc bộ.</p></div>
                    <div><span>Cụ thể hơn</span><p>Phát triển 3 trang giao diện bằng React cho website câu lạc bộ; phối hợp 4 thành viên và kiểm tra hiển thị trên mobile.</p></div>
                  </div>
                  <small>Ví dụ minh họa: chỉ dùng số liệu và kết quả đúng với trải nghiệm thật của bạn.</small>
                </section>
              </div>

              <aside className="cv-guide-side">
                <section className="cv-guide-check">
                  <span className="career-guides-eyebrow">TRƯỚC KHI GỬI</span>
                  <h3>Checklist nhanh</h3>
                  <ul>
                    <li><i className="bi bi-check2" /> CV nhắm tới một nhóm vị trí cụ thể</li>
                    <li><i className="bi bi-check2" /> Thông tin liên hệ chính xác</li>
                    <li><i className="bi bi-check2" /> Mỗi kinh nghiệm có động từ hành động</li>
                    <li><i className="bi bi-check2" /> Không có lỗi chính tả hoặc link hỏng</li>
                    <li><i className="bi bi-check2" /> File mở được và đặt tên chuyên nghiệp</li>
                  </ul>
                </section>
                <section className="cv-guide-check cv-guide-privacy">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  <h3>Bảo vệ thông tin</h3>
                  <p>Chỉ đưa thông tin cần cho tuyển dụng. Không cần ghi số giấy tờ tùy thân, thông tin tài khoản ngân hàng hoặc dữ liệu nhạy cảm.</p>
                </section>
                <Link className="career-guide-primary" to="/student/dashboard?tab=cv">
                  Tạo CV theo mẫu <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>
        )}

        {activeGuide === "market" && (
          <section className="career-guide-section">
            <div className="career-guide-intro career-market-heading">
              <div><span className="career-guides-eyebrow">SỐ LIỆU TỪ INTERNHUB</span><h2>Thị trường &amp; xu hướng tuyển dụng</h2><p>Tóm tắt các tin đang mở công khai. Đây là snapshot trên nền tảng, không đại diện toàn bộ thị trường lao động.</p></div>
              <button className="career-guide-secondary" disabled={marketLoading} onClick={refreshMarket} type="button"><i className={`bi ${marketLoading ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`} aria-hidden="true" /> Làm mới</button>
            </div>
            {marketError ? (
              <div className="career-market-state is-error" role="alert"><i className="bi bi-exclamation-circle" aria-hidden="true" /><p>{marketError}</p><button className="career-guide-secondary" onClick={refreshMarket} type="button">Thử lại</button></div>
            ) : marketLoading && !market ? (
              <div className="career-market-state"><span className="career-guide-spinner" />Đang tải thống kê tuyển dụng...</div>
            ) : market ? (
              <>
                <div className="career-market-metrics">
                  <article><span>Tin đang tuyển</span><strong>{number(market.total_jobs)}</strong><small>đã được duyệt</small></article>
                  <article><span>Vị trí cần tuyển</span><strong>{number(market.total_openings)}</strong><small>theo số lượng trên tin</small></article>
                  <article><span>Tin mới 30 ngày</span><strong>{number(market.recent_jobs_30_days)}</strong><small>tính từ ngày đăng</small></article>
                  <article><span>Tin có lương cụ thể</span><strong>{number(market.salary?.count)}</strong><small>không gồm tin thỏa thuận</small></article>
                </div>
                <div className="career-market-grid">
                  <MarketRanking title="Vị trí được đăng nhiều" icon="bi-briefcase" items={sortedCategories} maxValue={maxCategoryCount} />
                  <MarketRanking title="Địa điểm có nhiều cơ hội" icon="bi-geo-alt" items={sortedLocations} maxValue={maxLocationCount} />
                  <section className="career-market-panel">
                    <div className="career-market-panel__heading"><h3>Hình thức làm việc</h3><i className="bi bi-laptop" aria-hidden="true" /></div>
                    <div className="career-market-type-list">{(market.work_types || []).map((item) => <div key={item.internship_type}><span>{item.label}</span><strong>{item.jobs_count} tin</strong><small>{item.openings} vị trí</small></div>)}</div>
                  </section>
                  <section className="career-market-panel career-market-salary">
                    <div className="career-market-panel__heading"><h3>Mức lương công khai</h3><i className="bi bi-cash-coin" aria-hidden="true" /></div>
                    {market.salary?.count ? <><p>{money(market.salary.salary_min)} <span>đến</span> {money(market.salary.salary_max)}</p><small>Biên lương lấy từ {market.salary.count} tin có công bố mức lương.</small></> : <p className="career-market-no-data">Chưa đủ tin có lương công khai để tổng hợp.</p>}
                    <Link to="/tools?tool=salary">Tra cứu chi tiết <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
                  </section>
                </div>
                <p className="career-market-updated">Cập nhật lúc {relativeDate(market.updated_at)} · Chỉ tính tin đã được duyệt.</p>
              </>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

function MarketRanking({ title, icon, items, maxValue }) {
  return (
    <section className="career-market-panel">
      <div className="career-market-panel__heading"><h3>{title}</h3><i className={`bi ${icon}`} aria-hidden="true" /></div>
      {items.length ? <div className="career-market-ranking">{items.map((item) => <div className="career-market-rank" key={item.name}><div><strong>{item.name}</strong><span>{item.jobs_count} tin · {item.openings} vị trí</span></div><div className="career-market-rank-track"><i style={{ width: `${Math.max(4, item.jobs_count / maxValue * 100)}%` }} /></div></div>)}</div> : <p className="career-market-no-data">Chưa có dữ liệu tin đã duyệt.</p>}
    </section>
  );
}