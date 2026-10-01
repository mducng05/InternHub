import { Link } from "react-router-dom";
import AccountAvatarSettings from "../components/AccountAvatarSettings";
import { useAuth } from "../store/AuthContext";

export default function AccountProfile() {
  const { user } = useAuth();

  return (
    <main className="employer-profile-page">
      <div className="employer-profile-page__inner">
        <div className="employer-profile-breadcrumb">
          <Link to="/admin/dashboard">Dashboard</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <span>Ảnh đại diện</span>
        </div>
        <header className="employer-profile-header">
          <div>
            <span className="employer-profile-eyebrow">TÀI KHOẢN QUẢN TRỊ</span>
            <h1>Ảnh đại diện</h1>
            <p>{user?.email}</p>
          </div>
        </header>
        <AccountAvatarSettings />
      </div>
    </main>
  );
}