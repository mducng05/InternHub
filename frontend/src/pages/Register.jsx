import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerRequest } from "../api/auth";
import GoogleAuthButton from "../components/GoogleAuthButton";

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
        <div className="auth-card-header mb-4">
          <h2>Tạo tài khoản</h2>
          <p className="auth-card-subtitle">Tham gia thị trường lao động chỉ với vài bước đơn giản</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="full_name">
              <i className="bi bi-person text-pink"></i> Họ và tên
            </label>
            <input
              id="full_name"
              name="full_name"
              className="form-control"
              placeholder="Nhập họ và tên"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-7">
              <label className="form-label" htmlFor="email">
                <i className="bi bi-envelope text-pink"></i> Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="Nhập email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-5">
              <label className="form-label" htmlFor="phone">
                <i className="bi bi-telephone text-pink"></i> Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <fieldset className="mb-3">
            <legend className="form-label mb-2">
              <i className="bi bi-person-badge text-pink"></i> Bạn tham gia với vai trò
            </legend>
            <div className="role-options">
              <label className={form.role === "student" ? "role-option active" : "role-option"}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={handleChange}
                />
                <i className="bi bi-mortarboard"></i>
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
                <i className="bi bi-building"></i>
                <span>Nhà tuyển dụng</span>
              </label>
            </div>
          </fieldset>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="password">
                <i className="bi bi-lock text-pink"></i> Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength="8"
                className="form-control"
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="password_confirm">
                <i className="bi bi-shield-lock text-pink"></i> Xác nhận
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                minLength="8"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                value={form.password_confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <button className="btn btn-register w-100 mt-2" type="submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
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
