import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
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
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="job-categories" element={<AdminResource type="job-categories" />} />
            <Route path="student-skills" element={<AdminResource type="student-skills" />} />
            <Route path="industries" element={<AdminResource type="industries" />} />
            <Route path="skills" element={<AdminResource type="skills" />} />
            <Route path="locations" element={<AdminResource type="locations" />} />
            <Route path="student-profiles" element={<AdminResource type="student-profiles" />} />
            <Route path="employer-profiles" element={<AdminResource type="employer-profiles" />} />
            <Route path="users" element={<AdminResource type="users" />} />
            <Route path="jobs" element={<AdminResource type="jobs" />} />
            <Route path="job-skills" element={<AdminResource type="job-skills" />} />
            <Route path="applications" element={<AdminResource type="applications" />} />
            <Route path="reports" element={<AdminResource type="reports" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}