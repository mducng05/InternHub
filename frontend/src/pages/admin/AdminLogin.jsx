import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        setError("Tài khoản này không có quyền quản trị.");
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <header className="admin-login-header"><Link to="/" className="login-wordmark"><span>Q</span> QLPM</Link><span className="login-status"><i /> Admin gateway</span></header>
      <section className="admin-login-card">
        <div className="login-card-kicker"><span className="eyebrow">01 / SECURE ACCESS</span><span className="login-rule" /></div>
        <div className="admin-login-intro"><span className="eyebrow">CONTROL ROOM</span><h1>Điều hành<br /><em>có chủ đích.</em></h1><p>Một không gian tập trung để giữ cho QLPM tin cậy, rõ ràng và luôn vận hành tốt.</p></div>
        <div className="admin-login-form-panel">
          <span className="eyebrow">ADMIN ACCESS</span>
          <h2>Đăng nhập quản trị</h2>
          <p className="admin-login-subtitle">Sử dụng tài khoản quản trị viên của bạn.</p>
          <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
          <label htmlFor="admin-password">Mật khẩu</label>
          <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error && <div className="alert alert-danger mt-3">{error}</div>}
            <button className="admin-login-button" type="submit" disabled={loading}>{loading ? "Đang xác thực…" : "Vào trang quản trị"}<i className="bi bi-arrow-right" /></button>
          </form>
          <Link className="admin-login-back" to="/login"><i className="bi bi-arrow-left" /> Quay lại đăng nhập người dùng</Link>
        </div>
      </section>
    </main>
  );
}
