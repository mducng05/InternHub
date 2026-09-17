import { useLocation } from "react-router-dom";

const FloatingWidget = () => {
  const location = useLocation();

  // An widget khoi cac trang sau
  const excludedPaths = ["/login", "/register", "/change-password"];
  if (excludedPaths.includes(location.pathname) || location.pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <div className="floating-widget-container">
      <a
        href="/student/dashboard?tab=saved"
        className="floating-widget-button floating-widget-favorites"
        aria-label="Việc làm yêu thích"
        title="Việc làm yêu thích"
      >
        <i className="bi bi-heart-fill"></i>
      </a>

      <div className="floating-widget-actions">
        <a href="mailto:support@internhub.vn?subject=Góp ý cho InternHub" className="floating-widget-action">
          <i className="bi bi-chat-square-text"></i>
          <span>Góp ý</span>
        </a>
        <a href="mailto:support@internhub.vn?subject=Hỗ trợ InternHub" className="floating-widget-action">
          <i className="bi bi-headset"></i>
          <span>Hỗ trợ</span>
        </a>
      </div>
    </div>
  );
};

export default FloatingWidget;