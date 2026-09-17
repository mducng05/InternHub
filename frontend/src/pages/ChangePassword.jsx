import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../api/auth";
import { useAuth } from "../store/AuthContext";
import './ChangePassword.css';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isLongEnough = newPassword.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!oldPassword) {
      setErrorMessage("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!isLongEnough) {
      setErrorMessage("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      setSuccessMessage(res.data?.message || "Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Tự động điều hướng về dashboard sau 2.5 giây
      setTimeout(() => {
        if (user?.role === "admin") navigate("/admin/dashboard");
        else if (user?.role === "employer") navigate("/employer/dashboard");
        else navigate("/student/dashboard");
      }, 2500);
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.";
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="change-password-page">
      <div className="container change-password-container">
        <div className="change-password-card">
          {/* Header */}
          <div className="text-center mb-3.5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2.5"
              style={{
                width: "52px",
                height: "52px",
                backgroundColor: "#fff0f3",
                color: "#ff4d6d",
                fontSize: "1.45rem",
              }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h1 className="h4 fw-bold mb-1.5" style={{ color: "#800f2f", fontSize: "1.45rem" }}>
              Đổi mật khẩu
            </h1>
            <p className="text-secondary small mb-0" style={{ fontSize: "0.88rem", lineHeight: "1.55" }}>
              Để bảo vệ tài khoản của bạn, vui lòng tạo mật khẩu mạnh và không chia sẻ cho bất kỳ ai.
            </p>
          </div>

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-check-circle-fill flex-shrink-0 fs-6 text-success"></i>
              <div>
                <strong>{successMessage}</strong>
                <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                  Đang chuyển hướng về trang cá nhân của bạn...
                </p>
              </div>
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0 text-danger"></i>
              <div style={{ fontSize: "0.86rem" }}>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. MẬT KHẨU HIỆN TẠI */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-dark mb-1.5" htmlFor="old-password" style={{ fontSize: "0.84rem" }}>
                <i className="bi bi-key text-pink me-1"></i>
                Mật khẩu hiện tại <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  id="old-password"
                  type={showOld ? "text" : "password"}
                  className="form-control"
                  style={{ minHeight: "40px", fontSize: "0.92rem" }}
                  placeholder="Nhập mật khẩu đang dùng"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowOld(!showOld)}
                  tabIndex="-1"
                  aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showOld ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* 2. MẬT KHẨU MỚI */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-dark mb-1.5" htmlFor="new-password" style={{ fontSize: "0.84rem" }}>
                <i className="bi bi-lock text-pink me-1"></i>
                Mật khẩu mới <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  className="form-control"
                  style={{ minHeight: "40px", fontSize: "0.92rem" }}
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex="-1"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>

              {/* Yêu cầu độ dài mật khẩu */}
              {newPassword && (
                <div className="mt-1.5 small d-flex align-items-center gap-2">
                  <span
                    className={`badge rounded-pill ${isLongEnough ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                      }`}
                    style={{ fontSize: "0.76rem" }}
                  >
                    <i className={`bi ${isLongEnough ? "bi-check2" : "bi-x"} me-1`}></i>
                    Tối thiểu 8 ký tự
                  </span>
                </div>
              )}
            </div>

            {/* 3. XÁC NHẬN MẬT KHẨU MỚI */}
            <div className="mb-3.5">
              <label className="form-label fw-semibold small text-dark mb-1.5" htmlFor="confirm-password" style={{ fontSize: "0.84rem" }}>
                <i className="bi bi-shield-check text-pink me-1"></i>
                Xác nhận mật khẩu mới <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  className="form-control"
                  style={{ minHeight: "40px", fontSize: "0.92rem" }}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex="-1"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>

              {/* Trạng thái khớp mật khẩu */}
              {confirmPassword && (
                <div className="mt-1.5 small">
                  {isMatching ? (
                    <span className="text-success small d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}>
                      <i className="bi bi-check-circle-fill"></i> Mật khẩu xác nhận đã khớp
                    </span>
                  ) : (
                    <span className="text-danger small d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}>
                      <i className="bi bi-x-circle-fill"></i> Mật khẩu xác nhận chưa khớp
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* NÚT THAO TÁC */}
            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 mt-2.5 border-top">
              <Link
                to={user?.role === "student" ? "/student/dashboard" : "/"}
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-medium small"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="btn btn-pink text-white rounded-pill px-4 py-2 fw-semibold small shadow-sm d-flex align-items-center gap-2"
                disabled={loading || (newPassword && confirmPassword && !isMatching)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    Lưu mật khẩu mới
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
