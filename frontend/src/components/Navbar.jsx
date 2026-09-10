import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import logo from "../assets/logo02.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2 sticky-top">
      <div className="container-fluid px-4">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-success" to="/">
          <img
            src={logo}
            alt="Logo"
            height="35"
            style={{ transform: "scale(1.4)", transformOrigin: "left center" }}
          />
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto ms-4 gap-2">

            {/* Viec lam */}
            <li className="nav-item dropdown position-static nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="/jobs">
                  Việc làm
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem" }}></i>
                </span>
              </div>

              <div className="dropdown-menu navbar-mega-menu border-0 shadow-lg mt-0 p-4 rounded-bottom-4">
                <div className="container-fluid">
                  <div className="row g-4">

                    {/* CỘT 1 */}
                    <div className="col-md-3 border-end pe-4">
                      <div className="text-uppercase text-secondary fw-bold small mb-3">VIỆC LÀM</div>
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                        <li>
                          <Link to="/jobs" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-search text-secondary fs-5"></i> Tìm việc làm
                          </Link>
                        </li>
                        <li>
                          <Link to="/student/dashboard?tab=saved" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-bookmark text-secondary fs-5"></i> Việc làm đã lưu
                          </Link>
                        </li>
                        <li>
                          <Link to="/student/dashboard?tab=applied" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-check text-secondary fs-5"></i> Việc làm đã ứng tuyển
                          </Link>
                        </li>
                        <li>
                          <Link to="/student/dashboard?tab=recommended" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-hand-thumbs-up text-secondary fs-5"></i> Việc làm phù hợp
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* CỘT 2 */}
                    <div className="col-md-6 border-end px-4">
                      <div className="text-uppercase text-secondary fw-bold small mb-3">VIỆC LÀM THEO VỊ TRÍ</div>
                      <div className="row g-2">
                        <div className="col-6">
                          <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                            <li><Link to="/jobs?cat=backend" className="text-decoration-none text-dark">Backend Developer</Link></li>
                            <li><Link to="/jobs?cat=frontend" className="text-decoration-none text-dark">Frontend Developer</Link></li>
                            <li><Link to="/jobs?cat=marketing" className="text-decoration-none text-dark">Marketing Intern</Link></li>
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                            <li><Link to="/jobs?cat=tester" className="text-decoration-none text-dark">Tester / QC Intern</Link></li>
                            <li><Link to="/jobs?cat=design" className="text-decoration-none text-dark">UI/UX Design</Link></li>
                            <li><Link to="/jobs?cat=data" className="text-decoration-none text-dark">Data Analyst</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CỘT 3 */}
                    <div className="col-md-3 ps-4">
                      <div className="text-uppercase text-secondary fw-bold small mb-3">LĨNH VỰC</div>
                      <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                        <li><Link to="/jobs?industry=it" className="text-decoration-none text-dark">IT - Phần mềm</Link></li>
                        <li><Link to="/jobs?industry=finance" className="text-decoration-none text-dark">Tài chính / Ngân hàng</Link></li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            </li>

            {/* Tạo CV */}
            <li className="nav-item dropdown position-static nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="">
                  Tạo CV
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem" }}></i>
                </span>
              </div>

              <div className="dropdown-menu navbar-mega-menu border-0 shadow-lg mt-0 p-4 rounded-bottom-4">
                <div className="container-fluid">
                  <div className="row g-4">

                    {/* CỘT 1 */}
                    <div className="col-md-3 border-end pe-4">
                      <div className="text-uppercase text-secondary fw-bold small mb-3">CÁC MẪU CV THEO STYLE</div>
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                        <li>
                          <Link to="/student/dashboard?tab=cv" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-search text-secondary fs-5"></i> Mẫu CV đơn giản
                          </Link>
                        </li>
                        <li>
                          <Link to="/student/dashboard?tab=cv" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-bookmark text-secondary fs-5"></i> Mẫu CV ấn tượng
                          </Link>
                        </li>
                        <li>
                          <Link to="/student/dashboard?tab=cv" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-check text-secondary fs-5"></i> Mẫu CV chuyên nghiệp
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* CỘT 2 */}
                    <div className="col-md-6 border-end px-4">
                      <div className="text-uppercase text-secondary fw-bold small mb-3">CÁC MẪU CV THEO VỊ TRÍ ỨNG TUYỂN</div>
                      <div className="row g-2">
                        <div className="col-6">
                          <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                            <li><Link to="/jobs?cat=marketing" className="text-decoration-none text-dark">Nhân viên kinh doanh</Link></li>
                            <li><Link to="/jobs?cat=backend" className="text-decoration-none text-dark">Lập trình viên</Link></li>
                            <li><Link to="/jobs?industry=finance" className="text-decoration-none text-dark">Nhân viên kế toán</Link></li>
                            <li><Link to="/jobs?cat=marketing" className="text-decoration-none text-dark">Chuyên viên marketing</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CỘT 3 */}
                    <div className="col-md-3 ps-4">
                      <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                        <li><Link to="/student/dashboard?tab=profile" className="text-decoration-none text-dark">Quản lí CV</Link></li>
                        <li><Link to="/student/dashboard?tab=resume" className="text-decoration-none text-dark">Tải CV lên</Link></li>
                        <li><Link to="/jobs" className="text-decoration-none text-dark">Hướng dẫn viết CV</Link></li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            </li>

            {/* Công cụ */}
            <li className="nav-item dropdown nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="">
                  Công cụ
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem" }}></i>
                </span>
              </div>
              {/* Cột 1 */}
              <div className="dropdown-menu nav-tools-menu border-0 shadow-lg mt-0 p-3 rounded-3">
                <div className="row g-3">
                  <div className="col-6 border-end pe-3">
                    <div className="text-uppercase text-secondary fw-bold small mb-2">
                      Khám phá bản thân cá nhân
                    </div>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-ui-checks-grid me-2 text-secondary"></i> Trắc nghiệm MBTI
                    </Link>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-person-vcard me-2 text-secondary"></i> Trắc nghiệm MI
                    </Link>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-chat-square-text me-2 text-secondary"></i> Bộ câu hỏi phỏng vấn
                    </Link>
                  </div>
                  {/* Cột 2 */}
                  <div className="col-6 ps-3">
                    <div className="text-uppercase text-secondary fw-bold small mb-2">CÔNG CỤ</div>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-file-earmark-text me-2 text-secondary"></i> Tính thuế thu nhập cá nhân
                    </Link>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-search me-2 text-secondary"></i> Tra cứu lương
                    </Link>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-person-vcard me-2 text-secondary"></i> Tính lãi suất kép
                    </Link>
                    <Link to="" className="dropdown-item rounded-2 py-2">
                      <i className="bi bi-piggy-bank me-2 text-secondary"></i> Lập kế hoạch tiết kiệm
                    </Link>
                  </div>
                </div>
              </div>
            </li>

            {/* Cẩm nang */}
            <li className="nav-item dropdown nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1 " to="">
                  Cẩm nang
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem" }}></i>
                </span>
              </div>
              <div className="dropdown-menu nav-simple-menu border-0 shadow-lg mt-0 p-2 rounded-3">
                <Link to="" className="dropdown-item rounded-2 py-2">
                  <i className="bi bi-compass me-2 text-secondary"></i> Định hướng nghề nghiệp
                </Link>
                <Link to="" className="dropdown-item rounded-2 py-2">
                  <i className="bi bi-file-earmark-check me-2 text-secondary"></i> Bí quyết tìm việc
                </Link>
                <Link to="" className="dropdown-item rounded-2 py-2">
                  <i className="bi bi-chat-square-text me-2 text-secondary"></i> Thị trường & xu hướng tuyển dụng
                </Link>
              </div>
            </li>
          </ul>

          {/* Cụm nút hành động phải */}
          <div className="navbar-actions d-flex align-items-center gap-2">
            {!user && (
              <>
                <Link to="/register" className="btn btn-outline-success rounded-pill px-3">
                  Đăng ký
                </Link>
                <Link to="/login" className="btn btn-success rounded-pill px-3">
                  Đăng nhập
                </Link>
              </>
            )}

            {user && (
              <>
                <button type="button" className="navbar-icon-button" aria-label="Xem thông báo">
                  <i className="bi bi-bell"></i>
                  <span className="notification-dot" aria-hidden="true"></span>
                </button>

                <div className="user-menu nav-hover-dropdown">
                  <button type="button" className="user-menu-trigger" aria-label="Mở menu tài khoản">
                    <span className="user-avatar">
                      {(user.username || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <i className="bi bi-chevron-down user-menu-chevron"></i>
                  </button>

                  <div className="dropdown-menu user-dropdown-menu border-0 shadow-lg p-2">
                    <div className="user-dropdown-header">
                      <span className="user-avatar user-avatar-large">
                        {(user.username || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                      <div className="user-identity">
                        <strong>{user.username || user.email?.split("@")[0] || "Tài khoản"}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>

                    <div className="user-submenu nav-hover-dropdown">
                      <button
                        type="button"
                        className="user-dropdown-item user-primary-item user-submenu-trigger"
                        aria-expanded={activeSubmenu === "jobs"}
                        onClick={() => setActiveSubmenu(activeSubmenu === "jobs" ? null : "jobs")}
                      >
                        <span><i className="bi bi-briefcase me-2"></i>Quản lí tìm việc</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      <div className={`dropdown-menu user-submenu-menu border-0 shadow-lg p-2${activeSubmenu === "jobs" ? " is-open" : ""}`}>
                        <Link to="/student/dashboard?tab=saved" className="user-dropdown-item">
                          <i className="bi bi-bookmark me-2"></i>Việc làm đã lưu
                        </Link>
                        <Link to="/student/dashboard?tab=applied" className="user-dropdown-item">
                          <i className="bi bi-file-earmark-check me-2"></i>Việc làm đã ứng tuyển
                        </Link>
                      </div>
                    </div>

                    <Link to="/student/dashboard?tab=cv" className="user-dropdown-item user-primary-item">
                      <i className="bi bi-file-earmark-text me-2"></i>Quản lí CV
                    </Link>

                    <div className="user-submenu nav-hover-dropdown">
                      <button
                        type="button"
                        className="user-dropdown-item user-primary-item user-submenu-trigger"
                        aria-expanded={activeSubmenu === "security"}
                        onClick={() => setActiveSubmenu(activeSubmenu === "security" ? null : "security")}
                      >
                        <span><i className="bi bi-person-gear me-2"></i>Cá nhân &amp; bảo mật</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      <div className={`dropdown-menu user-submenu-menu border-0 shadow-lg p-2${activeSubmenu === "security" ? " is-open" : ""}`}>
                        <Link to="/student/profile" className="user-dropdown-item">
                          <i className="bi bi-person me-2"></i>Cài đặt thông tin cá nhân
                        </Link>
                        <Link to="/student/dashboard?tab=password" className="user-dropdown-item">
                          <i className="bi bi-shield-lock me-2"></i>Đổi mật khẩu
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>
                    {user.role === "student" && <Link to="/student/dashboard" className="user-dropdown-item"><i className="bi bi-grid me-2"></i>Dashboard</Link>}
                    {user.role === "employer" && <Link to="/employer/dashboard" className="user-dropdown-item"><i className="bi bi-grid me-2"></i>Dashboard</Link>}
                    {user.role === "admin" && <Link to="/admin/dashboard" className="user-dropdown-item"><i className="bi bi-grid me-2"></i>Dashboard</Link>}
                    <button onClick={handleLogout} className="user-dropdown-item user-logout">
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}