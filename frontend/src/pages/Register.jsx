import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerRequest } from "../api/auth";
import GoogleAuthButton from "../components/GoogleAuthButton";
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "student",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((currentForm) => ({ ...currentForm, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerRequest(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const responseErrors = err.response?.data;
      setError(
        responseErrors
          ? Object.values(responseErrors).flat().join(" ")
          : "Đăng ký không thành công. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <section className="auth-intro">
        <span className="auth-eyebrow">INTERNHUB</span>
        <h1>Mở khóa cơ hội thực tập phù hợp với bạn</h1>
        <p>
          Tạo tài khoản để khám phá việc làm, xây dựng hồ sơ và kết nối với nhà tuyển dụng.
        </p>
        <div className="auth-benefits">
          <span><i className="bi bi-check-circle"></i> Hồ sơ chuyên nghiệp</span>
          <span><i className="bi bi-check-circle"></i> Cơ hội được đề xuất</span>
          <span><i className="bi bi-check-circle"></i> Theo dõi ứng tuyển dễ dàng</span>
        </div>
      </section>

      <section className="auth-card register-card">
        <div className="auth-card-header mb-3.5">
          <h2>Đăng ký</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Họ và tên */}
          <div className="mb-3">
            <div className="auth-input-icon-wrap">
              <i className="bi bi-person auth-input-icon"></i>
              <input
                id="full_name"
                name="full_name"
                aria-label="Họ và tên"
                className="form-control auth-input-with-icon"
                placeholder="Họ và tên"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email & Số điện thoại */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-7">
              <div className="auth-input-icon-wrap">
                <i className="bi bi-envelope auth-input-icon"></i>
                <input
                  id="email"
                  name="email"
                  type="email"
                  aria-label="Email"
                  className="form-control auth-input-with-icon"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-5">
              <div className="auth-input-icon-wrap">
                <i className="bi bi-telephone auth-input-icon"></i>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  aria-label="Số điện thoại"
                  className="form-control auth-input-with-icon"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Mật khẩu & Xác nhận mật khẩu */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <div className="auth-input-icon-wrap">
                <i className="bi bi-lock auth-input-icon"></i>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength="8"
                  aria-label="Mật khẩu"
                  className="form-control auth-input-with-icon"
                  placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="auth-input-icon-wrap">
                <i className="bi bi-shield-lock auth-input-icon"></i>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  minLength="8"
                  aria-label="Xác nhận mật khẩu"
                  className="form-control auth-input-with-icon"
                  placeholder="Xác nhận mật khẩu"
                  value={form.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Vai trò tài khoản: Sinh viên / Nhà tuyển dụng (đặt dưới mật khẩu) */}
          <div className="mb-3.5">
            <div className="role-options">
              <label className={form.role === "student" ? "role-option active" : "role-option"}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={handleChange}
                />
                <i className="bi bi-mortarboard-fill"></i>
                <span>Sinh viên</span>
              </label>
              <label className={form.role === "employer" ? "role-option active" : "role-option"}>
                <input
                  type="radio"
                  name="role"
                  value="employer"
                  checked={form.role === "employer"}
                  onChange={handleChange}
                />
                <i className="bi bi-building-fill"></i>
                <span>Nhà tuyển dụng</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-1.5 px-3 small rounded-3 mb-2.5">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <button className="btn btn-register w-100 mt-2" type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <GoogleAuthButton text="Đăng ký bằng Google" role={form.role} onError={(msg) => setError(msg)} />

        <p className="auth-footer-text">
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
