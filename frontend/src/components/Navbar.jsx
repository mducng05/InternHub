import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import logo from "../assets/logo02.png";
import './Navbar.css';

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
            <li className="nav-item dropdown nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="/jobs">
                  Việc làm
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down nav-menu-chevron"></i>
                </span>
              </div>

              <div className="dropdown-menu nav-dropdown-menu nav-mega-menu border-0 shadow-lg mt-0">
                <div className="nav-dropdown-cols">
                  {/* CỘT 1 */}
                  <div className="nav-dropdown-col border-end pe-4">
                    <div className="nav-submenu-header">VIỆC LÀM CỦA BẠN</div>
                    <div className="nav-submenu-list">
                      <Link to="/jobs" className="nav-submenu-link">
                        <i className="bi bi-search nav-submenu-icon"></i>
                        <span>Tìm việc làm</span>
                      </Link>
                      <Link to="/student/dashboard?tab=saved" className="nav-submenu-link">
                        <i className="bi bi-bookmark nav-submenu-icon"></i>
                        <span>Việc làm đã lưu</span>
                      </Link>
                      <Link to="/student/dashboard?tab=applied" className="nav-submenu-link">
                        <i className="bi bi-file-earmark-check nav-submenu-icon"></i>
                        <span>Việc làm đã ứng tuyển</span>
                      </Link>
                      <Link to="/student/dashboard?tab=recommended" className="nav-submenu-link">
                        <i className="bi bi-stars nav-submenu-icon"></i>
                        <span>Việc làm phù hợp</span>
                      </Link>
                    </div>
                  </div>

                  {/* CỘT 2 */}
                  <div className="nav-dropdown-col border-end px-4">
                    <div className="nav-submenu-header">VIỆC LÀM THEO VỊ TRÍ</div>
                    <div className="nav-submenu-grid-2col">
                      <div className="nav-submenu-list">
                        <Link to="/jobs?cat=backend" className="nav-submenu-link">
                          <i className="bi bi-code-slash nav-submenu-icon"></i>
                          <span>Backend Developer</span>
                        </Link>
                        <Link to="/jobs?cat=frontend" className="nav-submenu-link">
                          <i className="bi bi-window-sidebar nav-submenu-icon"></i>
                          <span>Frontend Developer</span>
                        </Link>
                        <Link to="/jobs?cat=marketing" className="nav-submenu-link">
                          <i className="bi bi-megaphone nav-submenu-icon"></i>
                          <span>Marketing Intern</span>
                        </Link>
                      </div>
                      <div className="nav-submenu-list">
                        <Link to="/jobs?cat=tester" className="nav-submenu-link">
                          <i className="bi bi-check2-circle nav-submenu-icon"></i>
                          <span>Tester / QC Intern</span>
                        </Link>
                        <Link to="/jobs?cat=design" className="nav-submenu-link">
                          <i className="bi bi-palette nav-submenu-icon"></i>
                          <span>UI/UX Design</span>
                        </Link>
                        <Link to="/jobs?cat=data" className="nav-submenu-link">
                          <i className="bi bi-bar-chart nav-submenu-icon"></i>
                          <span>Data Analyst</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* CỘT 3 */}
                  <div className="nav-dropdown-col ps-4">
                    <div className="nav-submenu-header">LĨNH VỰC TUYỂN DỤNG</div>
                    <div className="nav-submenu-list">
                      <Link to="/jobs?industry=it" className="nav-submenu-link">
                        <i className="bi bi-laptop nav-submenu-icon"></i>
                        <span>IT - Phần mềm</span>
                      </Link>
                      <Link to="/jobs?industry=finance" className="nav-submenu-link">
                        <i className="bi bi-cash-coin nav-submenu-icon"></i>
                        <span>Tài chính / Ngân hàng</span>
                      </Link>
                      <Link to="/jobs?industry=ecommerce" className="nav-submenu-link">
                        <i className="bi bi-cart3 nav-submenu-icon"></i>
                        <span>Thương mại điện tử</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* Tạo CV */}
            <li className="nav-item dropdown nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="/student/dashboard?tab=cv">
                  Tạo CV
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down nav-menu-chevron"></i>
                </span>
              </div>

              <div className="dropdown-menu nav-dropdown-menu nav-mega-menu border-0 shadow-lg mt-0">
                <div className="nav-dropdown-cols">
                  {/* CỘT 1 */}
                  <div className="nav-dropdown-col border-end pe-4">
                    <div className="nav-submenu-header">CÁC MẪU CV THEO STYLE</div>
                    <div className="nav-submenu-list">
                      <Link to="/student/dashboard?tab=cv" className="nav-submenu-link">
                        <i className="bi bi-file-earmark-text nav-submenu-icon"></i>
                        <span>Mẫu CV đơn giản</span>
                      </Link>
                      <Link to="/student/dashboard?tab=cv" className="nav-submenu-link">
                        <i className="bi bi-stars nav-submenu-icon"></i>
                        <span>Mẫu CV ấn tượng</span>
                      </Link>
                      <Link to="/student/dashboard?tab=cv" className="nav-submenu-link">
                        <i className="bi bi-award nav-submenu-icon"></i>
                        <span>Mẫu CV chuyên nghiệp</span>
                      </Link>
                    </div>
                  </div>

                  {/* CỘT 2 */}
                  <div className="nav-dropdown-col border-end px-4">
                    <div className="nav-submenu-header">CÁC MẪU CV THEO VỊ TRÍ</div>
                    <div className="nav-submenu-list">
                      <Link to="/jobs?cat=marketing" className="nav-submenu-link">
                        <i className="bi bi-briefcase nav-submenu-icon"></i>
                        <span>Nhân viên kinh doanh</span>
                      </Link>
                      <Link to="/jobs?cat=backend" className="nav-submenu-link">
                        <i className="bi bi-code-slash nav-submenu-icon"></i>
                        <span>Lập trình viên</span>
                      </Link>
                      <Link to="/jobs?industry=finance" className="nav-submenu-link">
                        <i className="bi bi-calculator nav-submenu-icon"></i>
                        <span>Nhân viên kế toán</span>
                      </Link>
                      <Link to="/jobs?cat=marketing" className="nav-submenu-link">
                        <i className="bi bi-megaphone nav-submenu-icon"></i>
                        <span>Chuyên viên marketing</span>
                      </Link>
                    </div>
                  </div>

                  {/* CỘT 3 */}
                  <div className="nav-dropdown-col ps-4">
                    <div className="nav-submenu-header">TIỆN ÍCH HỖ TRỢ CV</div>
                    <div className="nav-submenu-list">
                      <Link to="/student/dashboard?tab=profile" className="nav-submenu-link">
                        <i className="bi bi-folder2-open nav-submenu-icon"></i>
                        <span>Quản lí CV</span>
                      </Link>
                      <Link to="/student/dashboard?tab=resume" className="nav-submenu-link">
                        <i className="bi bi-cloud-arrow-up nav-submenu-icon"></i>
                        <span>Tải CV lên</span>
                      </Link>
                      <Link to="/jobs" className="nav-submenu-link">
                        <i className="bi bi-journal-bookmark nav-submenu-icon"></i>
                        <span>Hướng dẫn viết CV</span>
                      </Link>
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
                  <i className="bi bi-chevron-down nav-menu-chevron"></i>
                </span>
              </div>

              <div className="dropdown-menu nav-dropdown-menu nav-tools-menu border-0 shadow-lg mt-0">
                <div className="nav-dropdown-cols">
                  {/* Cột 1 */}
                  <div className="nav-dropdown-col border-end pe-4">
                    <div className="nav-submenu-header">KHÁM PHÁ BẢN THÂN</div>
                    <div className="nav-submenu-list">
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-person-vcard nav-submenu-icon"></i>
                        <span>Trắc nghiệm tính cách</span>
                      </Link>
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-chat-square-text nav-submenu-icon"></i>
                        <span>Bộ câu hỏi phỏng vấn</span>
                      </Link>
                    </div>
                  </div>

                  {/* Cột 2 */}
                  <div className="nav-dropdown-col ps-4">
                    <div className="nav-submenu-header">CÔNG CỤ TÍNH TOÁN</div>
                    <div className="nav-submenu-list">
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-receipt nav-submenu-icon"></i>
                        <span>Tính thuế thu nhập cá nhân</span>
                      </Link>
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-search nav-submenu-icon"></i>
                        <span>Tra cứu mức lương</span>
                      </Link>
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-graph-up-arrow nav-submenu-icon"></i>
                        <span>Tính lãi suất kép</span>
                      </Link>
                      <Link to="" className="nav-submenu-link">
                        <i className="bi bi-piggy-bank nav-submenu-icon"></i>
                        <span>Lập kế hoạch tiết kiệm</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* Cẩm nang */}
            <li className="nav-item dropdown nav-hover-dropdown">
              <div className="d-flex align-items-center">
                <Link className="nav-link fw-medium text-dark pe-1" to="">
                  Cẩm nang
                </Link>
                <span className="nav-link ps-0 pe-2 text-dark" style={{ cursor: "pointer" }}>
                  <i className="bi bi-chevron-down nav-menu-chevron"></i>
                </span>
              </div>

              <div className="dropdown-menu nav-dropdown-menu nav-simple-menu border-0 shadow-lg mt-0">
                <div className="nav-dropdown-col">
                  <div className="nav-submenu-header">CẨM NANG NGHỀ NGHIỆP</div>
                  <div className="nav-submenu-list">
                    <Link to="" className="nav-submenu-link">
                      <i className="bi bi-compass nav-submenu-icon"></i>
                      <span>Định hướng nghề nghiệp</span>
                    </Link>
                    <Link to="" className="nav-submenu-link">
                      <i className="bi bi-lightbulb nav-submenu-icon"></i>
                      <span>Bí quyết tìm việc</span>
                    </Link>
                    <Link to="" className="nav-submenu-link">
                      <i className="bi bi-graph-up nav-submenu-icon"></i>
                      <span>Thị trường &amp; xu hướng tuyển dụng</span>
                    </Link>
                  </div>
                </div>
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
                      <div className={`user-submenu-menu${activeSubmenu === "jobs" ? " is-open" : ""}`}>
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
                      <div className={`user-submenu-menu${activeSubmenu === "security" ? " is-open" : ""}`}>
                        <Link to="/student/profile" className="user-dropdown-item">
                          <i className="bi bi-person me-2"></i>Cài đặt thông tin cá nhân
                        </Link>
                        <Link to="/change-password" className="user-dropdown-item">
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