import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import mbtiQuestions from "../utils/mbtiQuestions.json";
import {
  MBTI_TYPES,
  MBTI_IMAGES,
  calculateMbtiResult,
} from "../data/mbtiData";
import MbtiResultModal from "../components/MbtiResultModal";
import { useAuth } from "../store/AuthContext";
import "./MbtiTest.css";

const TOTAL_QUESTIONS = 70;
const STORAGE_KEY = "internhub_mbti_answers";
const STORAGE_RESULT_KEY = "internhub_mbti_result";

export default function MbtiTest() {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user && (user.role === "admin" || user.is_staff || user.is_superuser)
  );

  // Document title
  useEffect(() => {
    document.title = "Trắc Nghiệm Tính Cách MBTI (70 Câu) | InternHub";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Answers state: { [id]: 0 | 1 }
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Question palette modal
  const [showPalette, setShowPalette] = useState(false);

  // Result state
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESULT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);

  // Missing questions alert
  const [missingAlert, setMissingAlert] = useState(null);

  // References for scrolling
  const questionRefs = useRef({});

  // Save answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (e) {
      console.error("Lỗi lưu trữ câu trả lời:", e);
    }
  }, [answers]);

  // Save result to localStorage
  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
      }
    } catch (e) {
      console.error("Lỗi lưu trữ kết quả:", e);
    }
  }, [result]);

  // Answered count
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progressPercent = useMemo(() => {
    return Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  }, [answeredCount]);

  // Handle selecting an option
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    if (missingAlert) setMissingAlert(null);

    // Auto scroll to next question smoothly if next question exists and not answered yet
    if (questionId < TOTAL_QUESTIONS) {
      const nextId = questionId + 1;
      if (answers[nextId] === undefined) {
        setTimeout(() => {
          const nextEl = questionRefs.current[nextId];
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 180);
      }
    }
  };

  // Jump to specific question
  const scrollToQuestion = (qId) => {
    setShowPalette(false);
    setTimeout(() => {
      const el = questionRefs.current[qId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-pulse");
        setTimeout(() => el.classList.remove("highlight-pulse"), 1500);
      }
    }, 100);
  };

  // Submit and calculate result
  const handleSubmit = (force = false) => {
    // Find missing questions
    const unansweredIds = [];
    for (let id = 1; id <= TOTAL_QUESTIONS; id++) {
      if (answers[id] === undefined) {
        unansweredIds.push(id);
      }
    }

    if (unansweredIds.length > 0 && !force) {
      setMissingAlert({
        count: unansweredIds.length,
        firstId: unansweredIds[0],
      });
      return;
    }

    // Calculate result using scoring rules
    const calculated = calculateMbtiResult(answers);
    setResult(calculated);
    setShowResultModal(true);
    setMissingAlert(null);
  };

  // Reset test
  const handleReset = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn làm lại từ đầu? Mọi câu trả lời hiện tại sẽ được đặt lại."
      )
    ) {
      setAnswers({});
      setResult(null);
      setShowResultModal(false);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_RESULT_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Quick fill random answers for testing/demo (Admin only)
  const handleRandomFill = () => {
    if (!isAdmin) return;
    const dummy = {};
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      dummy[i] = Math.random() > 0.5 ? 1 : 0;
    }
    setAnswers(dummy);
  };

  return (
    <div className="mbti-page-wrapper">
      {/* 1. Header Banner */}
      <header className="mbti-hero-header text-center">
        <div className="container">
          <div className="mbti-badge-pill mb-3">
            <i className="bi bi-patch-check-fill"></i> Trắc Nghiệm Tính Cách Nghề Nghiệp
          </div>
          <h1 className="fw-bold mb-3 text-white" style={{ fontSize: "2.3rem", letterSpacing: "-0.5px" }}>
            Khám Phá Nhóm Tính Cách MBTI Của Bạn
          </h1>
          <p
            className="text-white-50 mx-auto mb-4"
            style={{ maxWidth: "680px", fontSize: "1.05rem", lineHeight: "1.6" }}
          >
            Trả lời 70 câu hỏi dưới đây một cách chân thật nhất theo phản xạ tự nhiên của bạn để nhận diện nhóm tính cách và định hướng cơ hội nghề nghiệp tương thích.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <div className="mbti-stat-chip text-white">
              <i className="bi bi-list-check"></i>
              <span><strong>70</strong> câu hỏi trắc nghiệm</span>
            </div>
            <div className="mbti-stat-chip text-white">
              <i className="bi bi-clock-history"></i>
              <span>~ <strong>10</strong> phút hoàn thành</span>
            </div>
            <div className="mbti-stat-chip text-white">
              <i className="bi bi-shield-check"></i>
              <span>Miễn phí 100%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container my-4" style={{ maxWidth: "880px" }}>
        {/* 2. Sticky Progress Bar & Actions / Completed Personality Banner */}
        {result ? (
          <section className="mbti-completed-banner mb-4 d-flex align-items-center gap-3 shadow-sm py-3 px-3 px-md-4">
            <img
              src={result.image || MBTI_IMAGES[result.type] || MBTI_IMAGES["INTJ"]}
              alt={result.type}
              style={{
                width: "72px",
                height: "90px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1.5px solid #ffccd5",
                background: "#fff",
                padding: "3px",
                boxShadow: "0 4px 12px rgba(201, 24, 74, 0.08)",
                flexShrink: 0,
              }}
            />
            <div className="flex-grow-1 d-flex flex-column justify-content-center text-start" style={{ minWidth: 0, textAlign: "left" }}>
              {/* Hàng 1: Nhóm tính cách bên trái & 3 nút chung 1 hàng bên phải */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2 flex-shrink-0 text-start">
                  <span
                    className="badge bg-pink text-white fw-bold px-2 py-0.5 rounded-pill"
                    style={{ fontSize: "0.8rem", letterSpacing: "0.3px" }}
                  >
                    {result.type}
                  </span>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                    {result.info?.name} <span className="text-secondary fw-normal">({result.info?.englishTitle})</span>
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className="btn btn-outline-pink rounded-pill"
                    style={{ fontSize: "0.78rem", fontWeight: 500, padding: "0.32rem 0.75rem" }}
                    onClick={() => setShowPalette(true)}
                    title="Xem lại 70 câu hỏi và lựa chọn của bạn"
                  >
                    <i className="bi bi-grid-3x3-gap-fill me-1"></i> Danh sách 70 câu
                  </button>
                  <button
                    type="button"
                    className="btn btn-pink rounded-pill shadow-sm"
                    style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0.32rem 0.85rem" }}
                    onClick={() => setShowResultModal(true)}
                  >
                    <i className="bi bi-eye-fill me-1"></i> Xem kết quả
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill"
                    style={{ fontSize: "0.78rem", fontWeight: 500, padding: "0.32rem 0.75rem" }}
                    onClick={handleReset}
                  >
                    <i className="bi bi-arrow-repeat me-1"></i> Làm lại
                  </button>
                </div>
              </div>

              {/* Hàng 2: Dòng text căn lề trái, nằm ngay dưới nhóm tính cách */}
              <p
                className="text-secondary small mb-0 mt-2 text-truncate text-start"
                style={{ fontSize: "0.86rem", lineHeight: "1.4", textAlign: "left" }}
                title={result.info?.tagline}
              >
                {result.info?.tagline
                  ? `“${result.info.tagline}”`
                  : "Định hình thế mạnh tính cách và phong cách làm việc lý tưởng của bạn."}
              </p>
            </div>
          </section>
        ) : (
          <section className="mbti-sticky-bar mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold" style={{ color: "var(--mbti-primary-dark)", fontSize: "0.95rem" }}>
                  Tiến độ:
                </span>
                <span className="badge rounded-pill bg-pink px-2.5 py-1">
                  {answeredCount} / {TOTAL_QUESTIONS} câu ({progressPercent}%)
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Question palette trigger */}
                <button
                  type="button"
                  className="btn btn-outline-pink btn-sm rounded-pill px-3"
                  onClick={() => setShowPalette(true)}
                >
                  <i className="bi bi-grid-3x3-gap-fill me-1"></i> Danh sách 70 câu
                </button>

                {/* Submit button */}
                <button
                  type="button"
                  className="btn btn-pink btn-sm rounded-pill px-4 fw-bold shadow-sm"
                  onClick={() => handleSubmit(false)}
                >
                  <i className="bi bi-send-check me-1"></i> Xem kết quả
                </button>
              </div>
            </div>

            {/* Progress bar fill */}
            <div className="mbti-progress-track">
              <div className="mbti-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </section>
        )}

        {/* Missing questions warning alert */}
        {missingAlert && (
          <div className="alert alert-pink border-pink d-flex flex-wrap align-items-center justify-content-between gap-2 py-3 px-4 rounded-4 mb-4 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill fs-5 text-pink"></i>
              <span>
                Bạn còn <strong>{missingAlert.count}</strong> câu chưa trả lời.
                Hãy trả lời hết để nhận kết quả chính xác nhất nhé!
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-pink rounded-pill px-3 fw-medium"
                onClick={() => scrollToQuestion(missingAlert.firstId)}
              >
                Đến câu {missingAlert.firstId}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={() => handleSubmit(true)}
              >
                Vẫn nộp bài
              </button>
            </div>
          </div>
        )}

        {/* 3. 70 Questions Continuous List (Liền mạch 1 trang) */}
        <div className="d-flex flex-column gap-3 mb-4">
          {mbtiQuestions.map((q) => {
            const selectedOpt = answers[q.id];
            const isAnswered = selectedOpt !== undefined;

            return (
              <article
                key={q.id}
                ref={(el) => (questionRefs.current[q.id] = el)}
                id={`question-${q.id}`}
                className={`mbti-question-card ${isAnswered ? "answered" : ""}`}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="mbti-question-badge">
                    Câu {q.id} / {TOTAL_QUESTIONS}
                  </span>

                  {isAnswered && (
                    <span className="badge bg-pink-subtle text-pink px-2.5 py-1 fw-bold rounded-pill">
                      <i className="bi bi-check2-circle me-1"></i> Đã chọn
                    </span>
                  )}
                </div>

                <h3 className="mbti-question-text">{q.question}</h3>

                <div className="row g-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const letter = optIdx === 0 ? "A" : "B";

                    return (
                      <div key={optIdx} className="col-12 col-md-6">
                        <button
                          type="button"
                          className={`mbti-option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                        >
                          <span className="mbti-option-letter">{letter}</span>
                          <span className="flex-grow-1">{opt.text}</span>
                          {isSelected && (
                            <i className="bi bi-check-circle-fill mbti-option-check"></i>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Submit Banner */}
        <div className="text-center p-4 bg-white border rounded-4 shadow-sm mb-4">
          <h4 className="fw-bold mb-2 text-dark">
            {result ? "Bạn đã hoàn thành bài kiểm tra MBTI!" : "Bạn đã hoàn thành các câu hỏi?"}
          </h4>
          <p className="text-muted mb-3">
            {result
              ? `Nhóm tính cách của bạn là ${result.type} - ${result.info?.name} (${result.info?.englishTitle}). Bạn có thể xem lại kết quả chi tiết hoặc làm lại bất cứ lúc nào.`
              : "Bấm nút dưới đây để hệ thống tự động tổng hợp và hiển thị nhóm tính cách MBTI của bạn."}
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-pink rounded-pill px-5 py-2.5 fw-bold shadow"
              style={{ fontSize: "1.1rem" }}
              onClick={() => handleSubmit(false)}
            >
              <i className="bi bi-trophy-fill me-2"></i> {result ? "Xem Kết Quả MBTI" : "Hoàn Thành & Xem Kết Quả"}
            </button>
            {result && (
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-medium"
                style={{ fontSize: "1.05rem" }}
                onClick={handleReset}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Làm Lại
              </button>
            )}
          </div>
        </div>

        {/* Footer info & demo helper */}
        <div className="d-flex flex-wrap align-items-center justify-content-between text-muted small py-3 px-2 border-top">
          <div className="d-flex gap-3 align-items-center">
            {isAdmin && (
              <button
                type="button"
                className="btn btn-link text-muted p-0 small text-decoration-none"
                onClick={handleRandomFill}
                title="Điền thử ngẫu nhiên 70 câu để kiểm tra pop-up nhanh chóng (Chỉ tài khoản Quản trị viên mới thấy)"
              >
                <i className="bi bi-lightning-charge me-1"></i> Điền nhanh ngẫu nhiên (Admin)
              </button>
            )}
            <button
              type="button"
              className="btn btn-link text-danger p-0 small text-decoration-none"
              onClick={handleReset}
            >
              <i className="bi bi-trash3 me-1"></i> Xóa làm lại
            </button>
          </div>
        </div>
      </div>

      {/* 4. RESULT POP-UP MODAL */}
      <MbtiResultModal
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
        result={result}
        onReset={handleReset}
      />

      {/* 5. QUESTION PALETTE MODAL */}
      <Modal
        show={showPalette}
        onHide={() => setShowPalette(false)}
        centered
        className="mbti-palette-modal"
      >
        <Modal.Header closeButton className="border-bottom pb-2">
          <Modal.Title className="fw-bold fs-5 text-dark">
            <i className="bi bi-grid-3x3-gap-fill text-pink me-2"></i> Danh Sách 70 Câu Hỏi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="d-flex align-items-center gap-3 mb-3 small text-muted">
            <div className="d-flex align-items-center gap-1.5">
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#fff0f3",
                  border: "1px solid #f1c2cd",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              ></span>
              <span>Đã chọn ({answeredCount})</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              ></span>
              <span>Chưa chọn ({TOTAL_QUESTIONS - answeredCount})</span>
            </div>
          </div>

          <div className="mbti-palette-grid">
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
              const qId = i + 1;
              const isAnswered = answers[qId] !== undefined;

              return (
                <button
                  key={qId}
                  type="button"
                  className={`mbti-palette-num ${isAnswered ? "answered" : ""}`}
                  onClick={() => scrollToQuestion(qId)}
                  title={`Câu hỏi ${qId}${isAnswered ? " (Đã chọn)" : " (Chưa chọn)"}`}
                >
                  {qId}
                </button>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button
            type="button"
            className="btn btn-secondary rounded-pill btn-sm px-4"
            onClick={() => setShowPalette(false)}
          >
            Đóng
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
