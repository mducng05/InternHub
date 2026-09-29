/**
 * CvScanModal — Upload CV → scan → popup top-5 recommended jobs.
 *
 * Props:
 *   isOpen            {boolean}   — controls visibility
 *   onClose           {function}  — called when user closes modal
 *   preloadedResult   {object}    — if provided, skip upload and show result directly
 *   preloadedScanning {boolean}   — true while auto-scan is still in progress
 */
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { recommendJobsFromCv } from "../api/profile";
import "./CvScanModal.css";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => (n / 1_000_000).toFixed(1).replace(".0", "") + "tr";
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
}

function ScoreLabel({ score }) {
  const pct = Math.round(score * 100);
  let cls = "cv-rec-score--low";
  if (pct >= 60) cls = "cv-rec-score--high";
  else if (pct >= 30) cls = "cv-rec-score--med";
  return (
    <span className={`cv-rec-score ${cls}`}>
      {pct > 0 ? `${pct}% phù hợp` : "Mới đăng"}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function CvScanModal({
  isOpen,
  onClose,
  preloadedResult = null,
  preloadedScanning = false,
}) {
  const inputRef = useRef(null);

  // Is this modal being driven by an external upload (auto mode)?
  const isAutoMode = preloadedResult !== null || preloadedScanning;

  // Manual-mode state (only used when user opens modal themselves)
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Active data: use preloaded when in auto-mode
  const activeResult = isAutoMode ? preloadedResult : result;
  const activeScanning = isAutoMode ? preloadedScanning : scanning;

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setFile(null);
    setScanning(false);
    setResult(null);
    setError("");
    onClose();
  }, [onClose]);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const pickFile = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.toLowerCase().split(".").pop();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setError("Chỉ hỗ trợ file PDF, DOC, DOCX.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File CV không được vượt quá 10 MB.");
      return;
    }
    setError("");
    setResult(null);
    setFile(selectedFile);
  };

  const handleFileInput = (e) => pickFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("cv_file", file);
      const { data } = await recommendJobsFromCv(formData);
      setResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Không thể phân tích CV. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  const hasRecommendations = activeResult?.recommendations?.length > 0;

  return (
    <div
      className="cv-scan-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Phân tích CV và gợi ý việc làm"
      onClick={handleOverlayClick}
    >
      <div className="cv-scan-dialog">
        {/* ── Header ── */}
        <div className="cv-scan-header">
          <div className="cv-scan-header-left">
            <div className="cv-scan-icon">
              <i className="bi bi-file-earmark-person" aria-hidden="true" />
            </div>
            <div className="cv-scan-header-text">
              <h2>Phân tích CV • Gợi ý việc làm</h2>
              <p>
                {isAutoMode
                  ? "Hệ thống đang phân tích CV vừa tải lên của bạn…"
                  : "Tải CV lên để nhận gợi ý việc làm phù hợp với kỹ năng của bạn"
                }
              </p>
            </div>
          </div>
          <button
            className="cv-scan-close"
            onClick={handleClose}
            aria-label="Đóng modal"
            type="button"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cv-scan-body">
          {/* Upload zone — only in manual mode, before any result */}
          {!isAutoMode && !activeScanning && !activeResult && (
            <>
              <div
                className={`cv-drop-zone${isDragging ? " is-dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                aria-label="Vùng kéo thả hoặc bấm để chọn file CV"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  onClick={(e) => { e.stopPropagation(); }}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <i className="bi bi-cloud-arrow-up cv-drop-zone-icon" aria-hidden="true" />
                <h3>
                  {isDragging ? "Thả file vào đây" : "Kéo & thả hoặc bấm để chọn CV"}
                </h3>
                <p>Hỗ trợ PDF, DOC, DOCX • Tối đa 10 MB</p>
              </div>

              {file && (
                <div className="cv-file-chip">
                  <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                  <span title={file.name}>{file.name}</span>
                  <button
                    className="cv-file-chip-remove"
                    type="button"
                    onClick={() => { setFile(null); setError(""); }}
                    aria-label="Xóa file đã chọn"
                  >
                    <i className="bi bi-x" aria-hidden="true" />
                  </button>
                </div>
              )}

              {error && (
                <div className="cv-scan-error" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}

          {/* Scanning state */}
          {activeScanning && (
            <div className="cv-scanning-state" aria-live="polite">
              <div className="cv-scanning-spinner" role="status" aria-label="Đang phân tích" />
              <h3>Đang phân tích CV…</h3>
              <p>Hệ thống đang trích xuất kỹ năng và địa chỉ từ file của bạn</p>
            </div>
          )}

          {/* Results */}
          {activeResult && !activeScanning && (
            <div className="cv-results-section">
              {/* Skills & Address tags */}
              {(activeResult.skills_found?.length > 0 || activeResult.address_found) && (
                <>
                  <p className="cv-results-label">
                    <i className="bi bi-stars me-1" aria-hidden="true" />
                    Phát hiện từ CV của bạn
                  </p>
                  <div className="cv-results-found-tags">
                    {activeResult.skills_found?.slice(0, 12).map((skill) => (
                      <span key={skill} className="cv-tag cv-tag--skill">
                        <i className="bi bi-code-square" aria-hidden="true" />
                        {skill}
                      </span>
                    ))}
                    {activeResult.address_found && (
                      <span className="cv-tag cv-tag--location">
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        {activeResult.address_found.slice(0, 60)}{activeResult.address_found.length > 60 ? "…" : ""}
                      </span>
                    )}
                    {activeResult.skills_found?.length === 0 && !activeResult.address_found && (
                      <span className="cv-tag cv-tag--location">Không trích xuất được thông tin</span>
                    )}
                  </div>
                </>
              )}

              {/* Job recommendations */}
              <p className="cv-results-label mt-3">
                <i className="bi bi-briefcase me-1" aria-hidden="true" />
                Việc làm phù hợp ({activeResult.recommendations?.length ?? 0} gợi ý)
              </p>

              {hasRecommendations ? (
                <div className="cv-rec-list">
                  {activeResult.recommendations.map((job) => {
                    const salary = formatSalary(job.salary_min, job.salary_max);
                    return (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="cv-rec-card"
                        onClick={handleClose}
                      >
                        <div className="cv-rec-logo" aria-hidden="true">
                          {job.employer?.logo
                            ? <img src={job.employer.logo} alt="" />
                            : <i className="bi bi-building" />
                          }
                        </div>
                        <div className="cv-rec-info">
                          <p className="cv-rec-title">{job.title}</p>
                          <p className="cv-rec-company">
                            {job.employer?.company_name}
                            {job.location && ` • ${job.location.name}`}
                          </p>
                          <div className="cv-rec-meta">
                            {salary && <span className="cv-rec-badge">{salary}</span>}
                            {job.internship_type_display && (
                              <span className="cv-rec-badge">{job.internship_type_display}</span>
                            )}
                            <ScoreLabel score={job.match_score} />
                          </div>
                        </div>
                        <i className="bi bi-arrow-right" style={{ color: "#d1d5db", alignSelf: "center" }} aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="cv-empty-state">
                  <i className="bi bi-inbox" aria-hidden="true" />
                  <p>Chưa tìm được việc làm phù hợp. Thử lại với CV cập nhật hơn nhé!</p>
                </div>
              )}

              {error && (
                <div className="cv-scan-error mt-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cv-scan-footer">
          {!activeResult ? (
            <>
              {/* In auto-mode while scanning: just show close */}
              {isAutoMode ? (
                <button
                  className="cv-scan-btn cv-scan-btn--ghost"
                  type="button"
                  onClick={handleClose}
                >
                  Đóng
                </button>
              ) : (
                <>
                  <button
                    className="cv-scan-btn cv-scan-btn--ghost"
                    type="button"
                    onClick={handleClose}
                  >
                    Huỷ
                  </button>
                  <button
                    id="cv-scan-submit-btn"
                    className="cv-scan-btn cv-scan-btn--primary"
                    type="button"
                    onClick={handleScan}
                    disabled={!file || activeScanning}
                  >
                    {activeScanning ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          style={{ width: "14px", height: "14px" }}
                        />
                        Đang phân tích…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic" aria-hidden="true" />
                        Phân tích CV
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {/* After result: show retry (manual mode only) and view-all link */}
              {!isAutoMode && (
                <button
                  className="cv-scan-btn cv-scan-btn--ghost"
                  type="button"
                  onClick={() => { setResult(null); setFile(null); }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                  Thử lại
                </button>
              )}
              {hasRecommendations && activeResult.jobs_url_params && (
                <Link
                  to={`/jobs?${activeResult.jobs_url_params}`}
                  className="cv-scan-btn cv-scan-btn--view-all"
                  onClick={handleClose}
                >
                  <i className="bi bi-search me-1" aria-hidden="true" />
                  Xem tất cả việc làm phù hợp
                </Link>
              )}
              <button
                className="cv-scan-btn cv-scan-btn--ghost"
                type="button"
                onClick={handleClose}
              >
                Đóng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
