import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminDashboard from "../pages/AdminDashboard";
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
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}