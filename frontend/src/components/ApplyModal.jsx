import { useState, useRef, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { applyJob } from "../api/applications";

export default function ApplyModal({ job, companyName, onClose, onSuccess }) {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Đóng modal khi nhấn phím ESC và khóa scroll trang
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // Kiểm tra định dạng hợp lệ (.doc, .docx, .pdf)
  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setErrorMessage("Chỉ chấp nhận file CV định dạng .doc, .docx hoặc .pdf!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Dung lượng file CV không được vượt quá 10MB!");
      return;
    }

    setErrorMessage("");
    setCvFile(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập Họ và tên.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập Email.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Vui lòng nhập Số điện thoại.");
      return;
    }
    if (!cvFile) {
      setErrorMessage("Vui lòng tải lên file CV (.doc, .docx, .pdf).");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("job_id", job?.id);
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("cv", cvFile);
      if (coverLetter.trim()) {
        formData.append("cover_letter", coverLetter.trim());
      }

      await applyJob(formData);
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi ứng tuyển:", err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Gửi hồ sơ ứng tuyển thất bại. Vui lòng thử lại.";
      setErrorMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="apply-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1050,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="apply-modal-dialog bg-white rounded-4 shadow-lg overflow-hidden w-100"
        style={{
          maxWidth: "580px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          animation: "modalFadeIn 0.25s ease-out forwards",
        }}
      >
        {/* HEADER MODAL */}
        <div
          className="apply-modal-header p-4 pb-3 border-bottom position-relative text-start"
          style={{ background: "linear-gradient(to right, #fff7f8, #ffffff)" }}
        >
          <div className="pe-4">
            <h3 className="fw-bold mb-1" style={{ color: "#800f2f", fontSize: "1.45rem" }}>
              <i className="bi bi-send-check text-pink me-2"></i>
              Ứng tuyển
            </h3>
            <p className="text-secondary small mb-0 fw-medium text-truncate">
              Vị trí: <span className="text-dark fw-semibold">{job?.title}</span> •{" "}
              <span className="text-pink fw-semibold">{companyName}</span>
            </p>
          </div>
          <button
            type="button"
            className="btn-close position-absolute top-0 end-0 m-3 p-2"
            aria-label="Đóng"
            onClick={onClose}
          ></button>
        </div>

        {/* BODY MODAL */}
        <div className="apply-modal-body p-4 overflow-y-auto text-start" style={{ flex: "1 1 auto" }}>
          {isSuccess ? (
            <div className="text-center py-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  fontSize: "2.2rem",
                }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Ứng tuyển thành công!</h4>
              <p className="text-muted small mb-4" style={{ maxWidth: "420px", margin: "0 auto" }}>
                Hồ sơ của bạn đã được gửi tới <strong>{companyName}</strong> cho vị trí{" "}
                <strong>{job?.title}</strong>. Nhà tuyển dụng sẽ xem xét và phản hồi qua email hoặc số điện thoại của bạn.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-pink text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="apply-job-form">
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* 1. TẢI LÊN CV */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark mb-1 d-flex justify-content-between">
                  <span>
                    <i className="bi bi-file-earmark-arrow-up text-pink me-1"></i>
                    Tải lên CV <span className="text-danger">*</span>
                  </span>
                  <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
                    Định dạng: .doc, .docx, .pdf
                  </span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="d-none"
                />

                {!cvFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cv-upload-dropzone p-3 text-center border-2 border-dashed rounded-3 cursor-pointer transition-all ${
                      dragActive ? "border-pink bg-pink-subtle" : "border-secondary-subtle bg-light"
                    }`}
                    style={{
                      cursor: "pointer",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                      borderColor: dragActive ? "#ff4d6d" : "#dee2e6",
                      backgroundColor: dragActive ? "#fff0f3" : "#fafafa",
                    }}
                  >
                    <i
                      className="bi bi-cloud-arrow-up-fill text-pink"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <p className="mb-1 mt-1 small fw-semibold text-dark">
                      Kéo thả CV của bạn vào đây hoặc <span className="text-pink text-decoration-underline">chọn file</span>
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
                      Hỗ trợ: PDF, DOC, DOCX (Dung lượng tối đa 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="selected-cv-card d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light">
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                      <div
                        className="cv-file-icon rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "42px",
                          height: "42px",
                          backgroundColor: cvFile.name.endsWith(".pdf") ? "#ffebee" : "#e3f2fd",
                          color: cvFile.name.endsWith(".pdf") ? "#d32f2f" : "#1976d2",
                          fontSize: "1.4rem",
                        }}
                      >
                        <i
                          className={
                            cvFile.name.endsWith(".pdf")
                              ? "bi bi-file-earmark-pdf-fill"
                              : "bi bi-file-earmark-word-fill"
                          }
                        ></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="mb-0 text-truncate fw-semibold small text-dark">
                          {cvFile.name}
                        </p>
                        <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                          {formatFileSize(cvFile.size)}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Đổi file
                      </button>
                      <button
                        type="button"
                        onClick={() => setCvFile(null)}
                        className="btn btn-sm btn-outline-danger rounded-circle p-1 d-flex align-items-center justify-content-center"
                        style={{ width: "26px", height: "26px" }}
                        title="Xóa file"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. HỌ VÀ TÊN */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark mb-1" htmlFor="apply-fullname">
                  <i className="bi bi-person text-pink me-1"></i>
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  id="apply-fullname"
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* 3. EMAIL */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark mb-1" htmlFor="apply-email">
                  <i className="bi bi-envelope text-pink me-1"></i>
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  id="apply-email"
                  type="email"
                  className="form-control"
                  placeholder="Ví dụ: nguyenvana@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 4. SỐ ĐIỆN THOẠI */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark mb-1" htmlFor="apply-phone">
                  <i className="bi bi-telephone text-pink me-1"></i>
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input
                  id="apply-phone"
                  type="tel"
                  className="form-control"
                  placeholder="Ví dụ: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* 5. THƯ GIỚI THIỆU (TÙY CHỌN) */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark mb-1" htmlFor="apply-coverletter">
                  <i className="bi bi-chat-left-text text-pink me-1"></i>
                  Lời nhắn gửi nhà tuyển dụng <span className="text-muted fw-normal">(Không bắt buộc)</span>
                </label>
                <textarea
                  id="apply-coverletter"
                  rows={3}
                  className="form-control small"
                  placeholder="Giới thiệu ngắn gọn thế mạnh, mong muốn hoặc lý do bạn phù hợp với vị trí này..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </form>
          )}
        </div>

        {/* FOOTER MODAL */}
        {!isSuccess && (
          <div className="apply-modal-footer p-3 px-4 border-top bg-light d-flex align-items-center justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-medium"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="apply-job-form"
              className="btn btn-pink text-white rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Đang gửi hồ sơ...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill"></i>
                  Nộp hồ sơ ứng tuyển
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
