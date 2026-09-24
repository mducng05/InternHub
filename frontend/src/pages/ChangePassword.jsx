import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, fetchMe } from "../api/auth";
import { useAuth } from "../store/AuthContext";
import "./ChangePassword.css";

export default function ChangePassword() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [hasUsablePassword, setHasUsablePassword] = useState(
    user?.has_usable_password !== false
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tự động kiểm tra trạng thái mật khẩu của tài khoản
  useEffect(() => {
    fetchMe()
      .then((res) => {
        if (res.data) {
          const usable = res.data.has_usable_password !== false;
          setHasUsablePassword(usable);
          updateUser({ has_usable_password: usable });
        }
      })
      .catch(() => {});
  }, []);

  const isGoogleAccount = !hasUsablePassword;
  const isLongEnough = newPassword.length >= 8;
  const isMatching = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isGoogleAccount && !oldPassword) {
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

    if (!isGoogleAccount && oldPassword === newPassword) {
      setErrorMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword({
        old_password: isGoogleAccount ? "" : oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      setSuccessMessage(res.data?.message || "Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasUsablePassword(true);
      updateUser({ has_usable_password: true });

      // Tự động điều hướng về dashboard sau 2 giây
      setTimeout(() => {
        if (user?.role === "admin") navigate("/admin/dashboard");
        else if (user?.role === "employer") navigate("/employer/dashboard");
        else navigate("/student/dashboard");
      }, 2000);
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
      <div className="change-password-container">
        <div className="change-password-card">
          {/* Header */}
          <div className="cp-header">
            <div className="cp-icon-wrap">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h1 className="cp-title">
              {isGoogleAccount ? "Thiết lập mật khẩu" : "Đổi mật khẩu"}
            </h1>
            <p className="cp-subtitle">
              {isGoogleAccount
                ? "Tài khoản của bạn đăng nhập qua Google. Hãy tạo mật khẩu để có thể đăng nhập bằng email & mật khẩu."
                : "Để bảo vệ tài khoản của bạn, vui lòng tạo mật khẩu mạnh và không chia sẻ cho bất kỳ ai."}
            </p>
          </div>

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="cp-alert cp-alert-success">
              <i className="bi bi-check-circle-fill flex-shrink-0"></i>
              <div>
                <strong>{successMessage}</strong>
                <div style={{ fontSize: "0.8rem", marginTop: "2px", opacity: 0.85 }}>
                  Đang chuyển hướng về trang cá nhân...
                </div>
              </div>
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="cp-alert cp-alert-error">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. MẬT KHẨU HIỆN TẠI */}
            <div className="cp-form-group">
              <label className="cp-label" htmlFor="old-password">
                <i className="bi bi-key"></i>
                Mật khẩu hiện tại {!isGoogleAccount && <span className="cp-required">*</span>}
              </label>
              <div className="cp-input-wrap">
                <input
                  id="old-password"
                  type={isGoogleAccount ? "text" : showOld ? "text" : "password"}
                  className={`cp-input ${isGoogleAccount ? "cp-input-disabled" : ""}`}
                  placeholder={
                    isGoogleAccount
                      ? "Tài khoản của bạn liên kết với Google. Hãy tạo mật khẩu để có thể đăng nhập bằng email & mật khẩu."
                      : "Nhập mật khẩu đang dùng"
                  }
                  title={
                    isGoogleAccount
                      ? "Tài khoản của bạn liên kết với Google. Hãy tạo mật khẩu để có thể đăng nhập bằng email & mật khẩu."
                      : undefined
                  }
                  value={isGoogleAccount ? "" : oldPassword}
                  onChange={(e) => !isGoogleAccount && setOldPassword(e.target.value)}
                  autoComplete={isGoogleAccount ? "off" : "current-password"}
                  disabled={isGoogleAccount}
                  readOnly={isGoogleAccount}
                  required={!isGoogleAccount}
                />
                {!isGoogleAccount && (
                  <button
                    type="button"
                    className="cp-eye-btn"
                    onClick={() => setShowOld(!showOld)}
                    tabIndex="-1"
                    aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <i className={`bi ${showOld ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                )}
              </div>
            </div>

            {/* 2. MẬT KHẨU MỚI */}
            <div className="cp-form-group">
              <label className="cp-label" htmlFor="new-password">
                <i className="bi bi-lock"></i>
                Mật khẩu mới <span className="cp-required">*</span>
              </label>
              <div className="cp-input-wrap">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  className="cp-input"
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="cp-eye-btn"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex="-1"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>

              {/* Gợi ý độ dài mật khẩu */}
              {newPassword && (
                <div className={`cp-hint ${isLongEnough ? "cp-hint-success" : "cp-hint-error"}`}>
                  <i className={`bi ${isLongEnough ? "bi-check-circle-fill" : "bi-x-circle"}`}></i>
                  <span>{isLongEnough ? "Độ dài hợp lệ (tối thiểu 8 ký tự)" : "Mật khẩu phải có tối thiểu 8 ký tự"}</span>
                </div>
              )}
            </div>

            {/* 3. XÁC NHẬN MẬT KHẨU MỚI */}
            <div className="cp-form-group">
              <label className="cp-label" htmlFor="confirm-password">
                <i className="bi bi-shield-check"></i>
                Xác nhận mật khẩu mới <span className="cp-required">*</span>
              </label>
              <div className="cp-input-wrap">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  className="cp-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="cp-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex="-1"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>

              {/* Gợi ý khớp mật khẩu */}
              {confirmPassword && (
                <div className={`cp-hint ${isMatching ? "cp-hint-success" : "cp-hint-error"}`}>
                  <i className={`bi ${isMatching ? "bi-check-circle-fill" : "bi-exclamation-circle"}`}></i>
                  <span>{isMatching ? "Mật khẩu xác nhận trùng khớp" : "Mật khẩu xác nhận chưa khớp"}</span>
                </div>
              )}
            </div>

            {/* NÚT THAO TÁC */}
            <div className="cp-actions">
              <Link
                to={user?.role === "student" ? "/student/dashboard" : "/"}
                className="cp-btn-cancel"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="cp-btn-submit"
                disabled={loading || (Boolean(newPassword) && Boolean(confirmPassword) && !isMatching)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    {isGoogleAccount ? "Thiết lập mật khẩu" : "Lưu mật khẩu mới"}
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
