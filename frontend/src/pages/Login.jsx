import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password);
      const dashboardByRole = {
        student: "/student/dashboard",
        employer: "/employer/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(dashboardByRole[loggedInUser.role] ?? "/");
    } catch {
      setError("Sai email hoặc mật khẩu");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Đăng nhập</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Mật khẩu"
      />
      {error && <p>{error}</p>}
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
