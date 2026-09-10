import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(
          err.response.data.detail === "No active account found with the given credentials"
            ? "Email hoặc mật khẩu không chính xác."
            : err.response.data.detail
        );
      } else if (err.message === "Network Error" || !err.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend server.");
      } else {
        setError("Email hoặc mật khẩu không chính xác.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page login-page">
      <section className="auth-intro">
        <span className="auth-eyebrow">INTERNHUB</span>
        <h1>Chào mừng bạn trở lại</h1>
        <p>
          Tiếp tục hành trình tìm kiếm cơ hội thực tập và phát triển sự nghiệp cùng InternHub.
        </p>
        <div className="auth-benefits">
          <span><i className="bi bi-check-circle"></i> Cập nhật cơ hội mới nhất</span>
          <span><i className="bi bi-check-circle"></i> Quản lý hồ sơ và ứng tuyển</span>
          <span><i className="bi bi-check-circle"></i> Kết nối đúng cơ hội</span>
        </div>
      </section>

      <section className="auth-card login-card">
        <div className="auth-card-header mb-4">
          <h2>Đăng nhập</h2>
          <p className="auth-card-subtitle">Chào mừng bạn quay trở lại với InternHub</p>
        </div>

        {location.state?.registered && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
            <i className="bi bi-check-circle-fill"></i>
            <span>Đăng ký thành công! Hãy đăng nhập để tiếp tục.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">
              <i className="bi bi-envelope text-pink"></i> Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="login-password">
              <i className="bi bi-lock text-pink"></i> Mật khẩu
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <button className="btn btn-register w-100 mt-2" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <GoogleAuthButton text="Đăng nhập bằng Google" role="student" onError={(msg) => setError(msg)} />

        <p className="auth-footer-text">
          Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}
