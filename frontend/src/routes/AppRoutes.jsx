import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminResource from "../pages/admin/AdminResource";
import EmployerDashboard from "../pages/EmployerDashboard";
import Home from "../pages/Home";
import JobDetail from "../pages/JobDetail";
import JobList from "../pages/JobList";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Register from "../pages/Register";
import StudentDashboard from "../pages/StudentDashboard";
import StudentProfile from "../pages/StudentProfile";
import ChangePassword from "../pages/ChangePassword";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student", "employer", "admin"]} />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminResource type="users" />} />
            <Route path="jobs" element={<AdminResource type="jobs" />} />
            <Route path="applications" element={<AdminResource type="applications" />} />
            <Route path="reports" element={<AdminResource type="reports" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}