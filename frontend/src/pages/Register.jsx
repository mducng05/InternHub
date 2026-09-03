import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerRequest } from "../api/auth";

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

      <section className="auth-card">
        <div className="mb-4">
          <h2>Tạo tài khoản</h2>
          <p className="text-muted mb-0">Tham gia thị trường lao động chỉ với vài bước đơn giản.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="full_name">Họ và tên</label>
            <input id="full_name" name="full_name" className="form-control" value={form.full_name} onChange={handleChange} required />
          </div>

          <div className="row g-3">
            <div className="col-md-7">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-5">
              <label className="form-label" htmlFor="phone">Số điện thoại</label>
              <input id="phone" name="phone" type="tel" className="form-control" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <fieldset className="mt-3 mb-3">
            <legend className="form-label mb-2">Bạn tham gia với vai trò</legend>
            <div className="role-options">
              <label className={form.role === "student" ? "role-option active" : "role-option"}>
                <input type="radio" name="role" value="student" checked={form.role === "student"} onChange={handleChange} />
                <i className="bi bi-mortarboard"></i><span>Sinh viên</span>
              </label>
              <label className={form.role === "employer" ? "role-option active" : "role-option"}>
                <input type="radio" name="role" value="employer" checked={form.role === "employer"} onChange={handleChange} />
                <i className="bi bi-building"></i><span>Nhà tuyển dụng</span>
              </label>
            </div>
          </fieldset>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="password">Mật khẩu</label>
              <input id="password" name="password" type="password" minLength="8" className="form-control" value={form.password} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="password_confirm">Xác nhận mật khẩu</label>
              <input id="password_confirm" name="password_confirm" type="password" minLength="8" className="form-control" value={form.password_confirm} onChange={handleChange} required />
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

          <button className="btn btn-register w-100 mt-4" type="submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0">
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
