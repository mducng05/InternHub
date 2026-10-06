/**
 * CvScanModal — Upload CV → scan → popup top recommended jobs.
 *
 * Props:
 *   isOpen            {boolean}   — controls visibility
 *   onClose           {function}  — called when user closes modal
 *   preloadedResult   {object}    — if provided, skip upload and show result directly
 *   preloadedScanning {boolean}   — true while auto-scan is still in progress
 *   preloadedError    {string}    — error message from auto-scan
 *   hasCurrentCv      {boolean}   — whether user already has a CV file in profile
 *   onSkillsSynced    {function}  — callback when skills are saved to profile
 */
import { useCallback, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recommendJobsFromCv, syncStudentSkills } from "../api/profile";
import "./CvScanModal.css";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => (n / 1_000_000).toFixed(1).replace(".0", "") + "tr";
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
}

function ScoreLabel({ score, percentage }) {
  const pct = percentage ?? Math.round((score || 0) * 100);
  let cls = "cv-rec-score--low";
  if (pct >= 70) cls = "cv-rec-score--high";
  else if (pct >= 40) cls = "cv-rec-score--med";
  return (
    <span className={`cv-rec-score ${cls}`}>
      <i className="bi bi-stars me-1" aria-hidden="true" />
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
  preloadedError = "",
  hasCurrentCv = false,
  onSkillsSynced = null,
}) {
  const inputRef = useRef(null);

  // Manual-mode state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Sync skills state
  const [syncingSkills, setSyncingSkills] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");

  // Active data
  const isAutoMode = preloadedResult !== null || preloadedScanning || Boolean(preloadedError);
  const activeResult = isAutoMode ? preloadedResult : result;
  const activeScanning = isAutoMode ? preloadedScanning : scanning;
  const displayError = preloadedError || error;

  useEffect(() => {
    setSyncSuccessMsg("");
  }, [activeResult]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setFile(null);
    setScanning(false);
    setResult(null);
    setError("");
    setSyncSuccessMsg("");
    onClose();
  }, [onClose]);

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

  const handleScanCurrentCv = async () => {
    setScanning(true);
    setError("");
    setResult(null);
    try {
      const { data } = await recommendJobsFromCv();
      setResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Không thể phân tích CV hiện tại. Vui lòng tải file mới lên.";
      setError(msg);
    } finally {
      setScanning(false);
    }
  };

  const handleSyncSkills = async () => {
    const skillsToSync = activeResult?.skills_found || [];
    if (!skillsToSync.length) return;
    setSyncingSkills(true);
    setSyncSuccessMsg("");
    try {
      const { data } = await syncStudentSkills(skillsToSync);
      setSyncSuccessMsg(data.message || `Đã lưu thành công ${data.added_count} kỹ năng vào hồ sơ!`);
      onSkillsSynced?.(data.all_skills);
    } catch {
      setSyncSuccessMsg("Không thể lưu kỹ năng lúc này. Vui lòng thử lại sau.");
    } finally {
      setSyncingSkills(false);
    }
  };

  if (!isOpen) return null;

  const hasRecommendations = activeResult?.recommendations?.length > 0;
  const candidateInfo = activeResult?.candidate;

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
                {activeScanning
                  ? "Hệ thống đang trích xuất kỹ năng và phân tích việc làm phù hợp…"
                  : isAutoMode
                  ? "Kết quả phân tích CV của bạn"
                  : "Tải CV hoặc dùng file sẵn có để nhận gợi ý việc làm chuẩn xác"
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
          {/* Error in auto-mode or manual-mode */}
          {displayError && !activeScanning && !activeResult && (
            <div className="text-center py-4 px-3">
              <div className="cv-scan-error text-start mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                <span>{displayError}</span>
              </div>
              <p className="text-secondary small mb-3">
                Bạn có thể thử quét lại hoặc chọn tải file CV khác.
              </p>
              <div className="d-flex justify-content-center gap-2">
                {hasCurrentCv && (
                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill px-3"
                    onClick={handleScanCurrentCv}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Thử lại với CV hiện có
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3"
                  onClick={() => {
                    setError("");
                    setResult(null);
                    setFile(null);
                    inputRef.current?.click();
                  }}
                >
                  <i className="bi bi-upload me-1" />
                  Chọn file khác
                </button>
              </div>
            </div>
          )}

          {/* Upload zone — only when no result, not scanning, and no error */}
          {!isAutoMode && !activeScanning && !activeResult && !displayError && (
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
                <p>Hỗ trợ PDF, DOCX, DOC • Tối đa 10 MB</p>
              </div>

              {hasCurrentCv && (
                <div className="cv-quick-scan-prompt mt-3 text-center">
                  <span className="text-secondary small me-2">Hoặc dùng CV hiện có trên hồ sơ:</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    onClick={handleScanCurrentCv}
                  >
                    <i className="bi bi-lightning-charge-fill me-1" aria-hidden="true" />
                    Quét nhanh CV hiện tại
                  </button>
                </div>
              )}

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
            </>
          )}

          {/* Scanning state */}
          {activeScanning && (
            <div className="cv-scanning-state" aria-live="polite">
              <div className="cv-scanning-spinner" role="status" aria-label="Đang phân tích" />
              <h3>Đang phân tích CV thông minh…</h3>
              <p>Trích xuất kỹ năng, kinh nghiệm và tìm kiếm tin tuyển dụng tương thích nhất</p>
            </div>
          )}

          {/* Results */}
          {activeResult && !activeScanning && (
            <div className="cv-results-section">
              {/* Extracted candidate summary box */}
              <div className="cv-extracted-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="cv-results-label mb-0">
                    <i className="bi bi-stars text-warning me-1" aria-hidden="true" />
                    Thông tin bóc tách từ CV
                  </span>
                  {activeResult.skills_found?.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-medium"
                      style={{ fontSize: "0.78rem" }}
                      onClick={handleSyncSkills}
                      disabled={syncingSkills}
                    >
                      {syncingSkills ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" style={{ width: "12px", height: "12px" }} />
                          Đang lưu…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-down me-1" />
                          Lưu vào hồ sơ
                        </>
                      )}
                    </button>
                  )}
                </div>

                {syncSuccessMsg && (
                  <div className="alert alert-success py-1 px-2 mb-2 small rounded-3 d-flex align-items-center gap-1">
                    <i className="bi bi-check-circle-fill text-success" />
                    <span>{syncSuccessMsg}</span>
                  </div>
                )}

                {/* Candidate contact badges */}
                {(candidateInfo?.email || candidateInfo?.phone || activeResult.address_found) && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {candidateInfo?.email && (
                      <span className="badge bg-light text-dark border fw-normal" title="Email ứng viên">
                        <i className="bi bi-envelope text-primary me-1" />
                        {candidateInfo.email}
                      </span>
                    )}
                    {candidateInfo?.phone && (
                      <span className="badge bg-light text-dark border fw-normal" title="Số điện thoại">
                        <i className="bi bi-telephone text-success me-1" />
                        {candidateInfo.phone}
                      </span>
                    )}
                    {activeResult.address_found && (
                      <span className="badge bg-light text-dark border fw-normal" title="Địa chỉ / Khu vực">
                        <i className="bi bi-geo-alt text-danger me-1" />
                        {activeResult.address_found}
                      </span>
                    )}
                  </div>
                )}

                {/* Skills found tags */}
                <div className="cv-results-found-tags">
                  {activeResult.skills_found?.map((skill) => (
                    <span key={skill} className="cv-tag cv-tag--skill">
                      <i className="bi bi-check-lg" aria-hidden="true" />
                      {skill}
                    </span>
                  ))}
                  {(!activeResult.skills_found || activeResult.skills_found.length === 0) && (
                    <span className="text-secondary small fst-italic">
                      Chưa phát hiện từ khóa kỹ năng rõ ràng trong file.
                    </span>
                  )}
                </div>
              </div>

              {/* Job recommendations header */}
              <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                <span className="cv-results-label mb-0">
                  <i className="bi bi-briefcase text-primary me-1" aria-hidden="true" />
                  Việc làm phù hợp nhất ({activeResult.recommendations?.length ?? 0} gợi ý)
                </span>
                <span className="text-muted small">Sắp xếp theo độ tương thích</span>
              </div>

              {hasRecommendations ? (
                <div className="cv-rec-list">
                  {activeResult.recommendations.map((job) => {
                    const salary = formatSalary(job.salary_min, job.salary_max);
                    const matched = job.matched_skills || [];
                    const missing = job.missing_skills || [];
                    return (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="cv-rec-card"
                        onClick={handleClose}
                      >
                        <div className="cv-rec-logo" aria-hidden="true">
                          {job.employer?.logo ? (
                            <img src={job.employer.logo} alt="" />
                          ) : (
                            <i className="bi bi-building" />
                          )}
                        </div>
                        <div className="cv-rec-info">
                          <div className="d-flex justify-content-between align-items-start gap-1">
                            <p className="cv-rec-title mb-0">{job.title}</p>
                            <ScoreLabel score={job.match_score} percentage={job.match_percentage} />
                          </div>
                          <p className="cv-rec-company mb-1">
                            {job.employer?.company_name}
                            {job.location && ` • ${job.location.name}`}
                          </p>

                          <div className="cv-rec-meta mb-2">
                            {salary && <span className="cv-rec-badge"><i className="bi bi-cash me-1" />{salary}</span>}
                            {job.internship_type_display && (
                              <span className="cv-rec-badge">{job.internship_type_display}</span>
                            )}
                          </div>

                          {/* Matched skills highlight */}
                          {matched.length > 0 && (
                            <div className="cv-rec-skills-row d-flex flex-wrap gap-1 align-items-center">
                              <span className="small text-success fw-medium" style={{ fontSize: "0.72rem" }}>
                                Trùng khớp:
                              </span>
                              {matched.slice(0, 4).map((sk) => (
                                <span key={sk} className="badge bg-success-subtle text-success border border-success-subtle py-0 px-2" style={{ fontSize: "0.7rem" }}>
                                  ✓ {sk}
                                </span>
                              ))}
                              {missing.length > 0 && (
                                <span className="text-muted small ms-1" style={{ fontSize: "0.7rem" }}>
                                  Cần thêm: {missing.slice(0, 2).join(", ")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <i className="bi bi-chevron-right text-muted ms-2 align-self-center" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="cv-empty-state">
                  <i className="bi bi-inbox" aria-hidden="true" />
                  <p>Chưa tìm được việc làm phù hợp theo tiêu chí hiện tại. Thử cập nhật thêm kỹ năng nhé!</p>
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
              {!isAutoMode && (
                <button
                  className="cv-scan-btn cv-scan-btn--ghost"
                  type="button"
                  onClick={() => { setResult(null); setFile(null); setSyncSuccessMsg(""); }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                  Quét file khác
                </button>
              )}
              {hasRecommendations && activeResult.jobs_url_params && (
                <Link
                  to={`/jobs?${activeResult.jobs_url_params}`}
                  className="cv-scan-btn cv-scan-btn--view-all"
                  onClick={handleClose}
                >
                  <i className="bi bi-search me-1" aria-hidden="true" />
                  Xem tất cả việc làm phù hợp ({activeResult.recommendations.length})
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
