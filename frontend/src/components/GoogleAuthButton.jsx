import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function GoogleAuthButton({ role = "student", text = "Đăng nhập bằng Google", onError }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const buttonContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      const msg = "Không nhận được mã xác thực từ Google.";
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const user = await googleLogin(response.credential, role);
      if (user?.role === "employer") {
        navigate("/employer/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Lỗi xác thực Google:", err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Đăng nhập bằng Google thất bại. Vui lòng thử lại.";
      setErrorMessage(detail);
      onError?.(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setConfigMissing(true);
      return;
    }

    setConfigMissing(false);

    // Tải script Google Identity Services nếu chưa có
    const loadGsiScript = () => {
      if (window.google?.accounts?.id) {
        initGoogleButton();
        return;
      }

      const existingScript = document.getElementById("google-gsi-client");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGoogleButton();
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGoogleButton);
      }
    };

    const initGoogleButton = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Xóa các nút cũ trước khi render lại
        buttonContainerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: text.includes("ký") || text.includes("tạo") ? "signup_with" : "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 400,
        });
      } catch (err) {
        console.warn("Lỗi khởi tạo Google button:", err);
      }
    };

    loadGsiScript();
  }, [clientId, text, role]);

  const handleFallbackClick = () => {
    if (!clientId) {
      alert(
        "Bạn chưa cấu hình VITE_GOOGLE_CLIENT_ID trong file frontend/.env!\n\nVui lòng mở file frontend/.env và dán:\nVITE_GOOGLE_CLIENT_ID=your_client_id_here\n\nSau đó khởi động lại hoặc lưu file."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="google-auth-container w-100 my-2">
      {errorMessage && (
        <div className="alert alert-danger py-2 small mb-2 text-start">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMessage}
        </div>
      )}

      {loading && (
        <div className="text-center py-2 text-muted small">
          <div className="spinner-border spinner-border-sm text-pink me-2" role="status"></div>
          Đang xác thực tài khoản Google...
        </div>
      )}

      {/* Nút chính thức do Google SDK tự động vẽ khi có Client ID */}
      <div
        ref={buttonContainerRef}
        className={`d-flex justify-content-center w-100 ${loading ? "d-none" : ""}`}
        style={{ minHeight: "44px" }}
      >
        {/* Nút fallback hiển thị khi chưa render kịp hoặc khi chưa điền Client ID */}
        <button
          type="button"
          onClick={handleFallbackClick}
          className="btn-google-auth w-100"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          <span>{text}</span>
        </button>
      </div>

      {configMissing && (
        <p className="text-muted small mt-2 mb-0 text-center" style={{ fontSize: "0.8rem" }}>
          <i className="bi bi-info-circle text-pink me-1"></i>
          Dán mã Google Client ID vào file <code>frontend/.env</code> để kích hoạt đăng nhập 1-chạm.
        </p>
      )}
    </div>
  );
}
