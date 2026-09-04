import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

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
    } catch {
      setError("Email hoặc mật khẩu không chính xác.");
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
        <div className="mb-4">
          <h2>Đăng nhập</h2>
          <p className="text-muted mb-0">Đăng nhập để tiếp tục sử dụng.</p>
        </div>

        {location.state?.registered && (
          <div className="alert alert-success">Đăng ký thành công. Hãy đăng nhập để tiếp tục.</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button className="btn btn-register w-100 mt-2" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0">
          Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}
