import { useState, useMemo, useEffect } from "react";
import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_QUESTIONS,
  CAREER_HANDBOOK_ITEMS
} from "../data/interviewQuestionsData";
import "./InterviewQuestions.css";

export default function InterviewQuestions() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openQuestionIds, setOpenQuestionIds] = useState(() => new Set([1])); // default open first question
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_interview_questions");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeHandbookModal, setActiveHandbookModal] = useState(null);
  const [modalCopied, setModalCopied] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Bộ Câu Hỏi Phỏng Vấn Xin Việc & Gợi Ý Trả Lời | InternHub";
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("saved_interview_questions", JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  // Toggle open question
  const toggleQuestion = (id) => {
    setOpenQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    const allFilteredIds = filteredQuestions.map((q) => q.id);
    setOpenQuestionIds(new Set(allFilteredIds));
  };

  const handleCollapseAll = () => {
    setOpenQuestionIds(new Set());
  };

  // Toggle bookmark
  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy sample answer
  const handleCopyAnswer = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Copy modal text (chỉ sao chép nội dung)
  const handleCopyModalText = (text) => {
    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
      success = true;
    } else {
      success = fallbackCopy(text);
    }
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  const fallbackCopy = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    let res = false;
    try {
      res = document.execCommand("copy");
    } catch (e) {
      console.error(e);
    }
    document.body.removeChild(el);
    return res;
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter((q) => {
      // Category filter
      if (selectedCategory !== "all" && q.category !== selectedCategory) {
        return false;
      }
      // Bookmark filter
      if (showOnlyBookmarks && !bookmarkedIds.has(q.id)) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, showOnlyBookmarks, bookmarkedIds]);

  return (
    <div className="interview-page">
      {/* CATEGORY FILTER BAR */}
      <section className="interview-hero text-center">
        <div className="container">
          {/* Category Filter Pills */}
          <div className="category-filter-bar">
            {INTERVIEW_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <i className={`bi ${cat.icon}`}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="container my-5">
        <div className="row g-4">
          {/* CỘT TRÁI: DANH SÁCH 30 CÂU HỎI */}
          <div className="col-12 col-lg-8">
            {/* Control bar */}
            <div className="interview-controls-bar">
              <div className="count-badge">
                Hiển thị <strong>{filteredQuestions.length}</strong> / 30 câu hỏi
              </div>
              <div className="control-actions">
                <button
                  type="button"
                  className={`btn-ctrl ${showOnlyBookmarks ? "active-toggle" : ""}`}
                  onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                >
                  <i className={`bi ${showOnlyBookmarks ? "bi-bookmark-check-fill" : "bi-bookmark"}`}></i>
                  <span>Đã lưu ({bookmarkedIds.size})</span>
                </button>
                <button type="button" className="btn-ctrl" onClick={handleExpandAll}>
                  <i className="bi bi-arrows-expand"></i>
                  <span>Mở tất cả</span>
                </button>
                <button type="button" className="btn-ctrl" onClick={handleCollapseAll}>
                  <i className="bi bi-arrows-collapse"></i>
                  <span>Thu gọn</span>
                </button>
              </div>
            </div>

            {/* Empty state */}
            {filteredQuestions.length === 0 && (
              <div className="empty-questions-state">
                <i className="bi bi-search"></i>
                <h5>Không tìm thấy câu hỏi phù hợp</h5>
                <p>Vui lòng thử tìm với từ khóa khác hoặc xóa bộ lọc danh mục.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-pink rounded-pill text-white px-3"
                  onClick={() => {
                    setSelectedCategory("all");
                    setShowOnlyBookmarks(false);
                  }}
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className="questions-list">
              {filteredQuestions.map((item) => {
                const isOpen = openQuestionIds.has(item.id);
                const isBookmarked = bookmarkedIds.has(item.id);
                const formattedNum = item.id < 10 ? `0${item.id}` : `${item.id}`;

                return (
                  <article
                    key={item.id}
                    id={`question-${item.id}`}
                    className={`question-item-card ${isOpen ? "is-open" : ""}`}
                  >
                    {/* Header: Click to toggle detail */}
                    <div
                      className="question-card-header"
                      onClick={() => toggleQuestion(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          toggleQuestion(item.id);
                        }
                      }}
                      aria-expanded={isOpen}
                    >
                      <div className="question-header-left">
                        <div className="question-number-badge">
                          #{formattedNum}
                        </div>
                        <div className="question-title-wrap">
                          <h3 className="question-main-title">{item.title}</h3>
                          <div className="question-tags-line">
                            <span className="tag-badge tag-category">
                              {INTERVIEW_CATEGORIES.find((c) => c.id === item.category)?.label || "Phổ biến"}
                            </span>
                            <span className={`tag-badge tag-difficulty ${item.difficulty === "Quan trọng" ? "diff-quan-trong" : item.difficulty.includes("Tình huống") ? "diff-tinh-huong" : ""}`}>
                              {item.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="question-header-right">
                        <button
                          type="button"
                          className={`btn-bookmark ${isBookmarked ? "bookmarked" : ""}`}
                          onClick={(e) => toggleBookmark(item.id, e)}
                          title={isBookmarked ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi để ôn tập"}
                          aria-label="Lưu câu hỏi"
                        >
                          <i className={`bi ${isBookmarked ? "bi-bookmark-heart-fill" : "bi-bookmark"}`}></i>
                        </button>
                        <span className="chevron-icon" aria-hidden="true">
                          <i className="bi bi-chevron-down"></i>
                        </span>
                      </div>
                    </div>

                    {/* Body: Detailed Answer & Guidance (when opened) */}
                    {isOpen && (
                      <div className="question-card-body">
                        {/* 1. Mục đích của nhà tuyển dụng */}
                        <div className="detail-section-block purpose-block">
                          <div className="section-label">
                            <i className="bi bi-bullseye"></i>
                            <span>Mục đích của Nhà tuyển dụng</span>
                          </div>
                          <p className="purpose-text">{item.purpose}</p>
                        </div>

                        {/* 2. Bí quyết trả lời */}
                        {item.tips && item.tips.length > 0 && (
                          <div className="detail-section-block tips-block">
                            <div className="section-label">
                              <i className="bi bi-lightbulb-fill"></i>
                              <span>Bí quyết &amp; Hướng dẫn trả lời</span>
                            </div>
                            <ul className="tips-list">
                              {item.tips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 3. Gợi ý câu trả lời mẫu */}
                        <div className="detail-section-block sample-answer-block">
                          <div className="sample-header-row">
                            <div className="section-label">
                              <i className="bi bi-chat-left-quote-fill"></i>
                              <span>Gợi ý câu trả lời mẫu</span>
                            </div>
                            <button
                              type="button"
                              className={`copy-btn ${copiedId === item.id ? "copied" : ""}`}
                              onClick={(e) => handleCopyAnswer(item.id, item.sampleAnswer, e)}
                              title="Sao chép câu trả lời mẫu"
                            >
                              <i className={`bi ${copiedId === item.id ? "bi-check2" : "bi-clipboard"}`}></i>
                              <span>{copiedId === item.id ? "Đã sao chép!" : "Sao chép"}</span>
                            </button>
                          </div>
                          <div className="sample-quote-box">
                            "{item.sampleAnswer}"
                          </div>
                        </div>

                        {/* 4. Những điều nên tránh */}
                        {item.donts && item.donts.length > 0 && (
                          <div className="detail-section-block donts-block">
                            <div className="section-label">
                              <i className="bi bi-exclamation-triangle-fill"></i>
                              <span>Những điều nên tránh / Lưu ý</span>
                            </div>
                            <ul className="donts-list">
                              {item.donts.map((d, idx) => (
                                <li key={idx}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: HÀNH TRANG TÌM VIỆC & MỤC LỤC NHANH */}
          <div className="col-12 col-lg-4">
            <div className="interview-sidebar-sticky">
              {/* CARD 1: HÀNH TRANG TÌM VIỆC (8 mục) */}
              <div className="sidebar-handbook-card">
                <div className="handbook-card-header">
                  <div className="handbook-title-wrap">
                    <i className="bi bi-briefcase-fill"></i>
                    <h5>Hành trang tìm việc</h5>
                  </div>
                  <span className="handbook-count-badge">8 công cụ</span>
                </div>

                <div className="handbook-items-list">
                  {CAREER_HANDBOOK_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="handbook-item-btn"
                      onClick={() => setActiveHandbookModal(item)}
                    >
                      <div
                        className="handbook-item-icon"
                        style={{ backgroundColor: item.color || "#800f2f" }}
                      >
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="handbook-item-text">
                        <span className="handbook-item-title">{item.title}</span>
                        <span className="handbook-item-badge">{item.badge}</span>
                      </div>
                      <i className="bi bi-chevron-right handbook-arrow-icon"></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL HÀNH TRANG TÌM VIỆC (CHI TIẾT EMAIL, BÍ QUYẾT, NGOẠI NGỮ) */}
      {activeHandbookModal && (
        <div
          className="handbook-modal-backdrop"
          onClick={() => setActiveHandbookModal(null)}
        >
          <div
            className="handbook-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="handbook-modal-header">
              <div className="modal-header-left">
                <div
                  className="modal-header-icon"
                  style={{ backgroundColor: activeHandbookModal.color || "#800f2f" }}
                >
                  <i className={`bi ${activeHandbookModal.icon}`}></i>
                </div>
                <div>
                  <h4 className="modal-header-title">{activeHandbookModal.title}</h4>
                  <span className="badge bg-light text-muted border mt-1">
                    {activeHandbookModal.badge}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveHandbookModal(null)}
                aria-label="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="handbook-modal-body">
              <p className="modal-intro-text">
                {activeHandbookModal.details?.intro || activeHandbookModal.summary}
              </p>

              {/* Template view (for Email templates) */}
              {activeHandbookModal.details?.body && (
                <div className="modal-template-box">
                  <div className="modal-template-header">
                    <span>
                      <i className="bi bi-file-earmark-text me-2"></i>
                      {activeHandbookModal.details.templateTitle || "Nội dung mẫu"}
                    </span>
                    <button
                      type="button"
                      className={`btn btn-sm ${modalCopied ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => handleCopyModalText(activeHandbookModal.details.body)}
                      title="Sao chép phần nội dung thư mẫu (không bao gồm tiêu đề)"
                    >
                      <i className={`bi ${modalCopied ? "bi-check2" : "bi-clipboard"} me-1`}></i>
                      {modalCopied ? "Đã sao chép nội dung!" : "Sao chép nội dung"}
                    </button>
                  </div>
                  {activeHandbookModal.details.subject && (
                    <div className="p-3 bg-light border-bottom small">
                      <strong>Tiêu đề email gợi ý: </strong>
                      <span className="text-pink fw-semibold">
                        {activeHandbookModal.details.subject}
                      </span>
                    </div>
                  )}
                  <pre className="template-content-view">
                    {activeHandbookModal.details.body}
                  </pre>
                </div>
              )}

              {/* Checklist view (for Online interview) */}
              {activeHandbookModal.details?.checklist && (
                <div className="detail-section-block tips-block">
                  <div className="section-label">
                    <i className="bi bi-check2-circle"></i>
                    <span>Checklist chuẩn bị kỹ thuật trước giờ G</span>
                  </div>
                  <ul className="tips-list">
                    {activeHandbookModal.details.checklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Foreign language phrases */}
              {activeHandbookModal.details?.phrases && (
                <div className="phrases-container">
                  <h6 className="fw-bold mb-3 text-secondary">
                    <i className="bi bi-translate me-2"></i>
                    Câu hỏi và gợi ý trả lời thông dụng:
                  </h6>
                  {activeHandbookModal.details.phrases.map((phrase, idx) => (
                    <div key={idx} className="phrase-card">
                      <div className="phrase-native">
                        {phrase.cn || phrase.jp || phrase.kr || phrase.en}
                      </div>
                      {phrase.pinyin && <div className="phrase-pinyin">Phiên âm: {phrase.pinyin}</div>}
                      <div className="phrase-vi">👉 Dịch nghĩa: {phrase.vi}</div>
                      {phrase.hint && <div className="phrase-hint">💡 Gợi ý: {phrase.hint}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Intern questions */}
              {activeHandbookModal.details?.keyQuestions && (
                <div className="key-questions-list">
                  <h6 className="fw-bold mb-3 text-secondary">
                    <i className="bi bi-question-circle me-2"></i>
                    Các câu hỏi cốt lõi hay gặp:
                  </h6>
                  {activeHandbookModal.details.keyQuestions.map((q, idx) => (
                    <div key={idx} className="phrase-card">
                      <div className="fw-bold text-pink mb-1">{q.q}</div>
                      <div className="small text-muted">👉 Hướng trả lời: {q.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips list */}
              {activeHandbookModal.details?.tips && (
                <div className="detail-section-block tips-block">
                  <div className="section-label">
                    <i className="bi bi-lightbulb-fill"></i>
                    <span>Lời khuyên quan trọng</span>
                  </div>
                  <ul className="tips-list">
                    {activeHandbookModal.details.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
