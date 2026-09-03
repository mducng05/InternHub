import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const profileFields = [
	{ key: "full_name", label: "Họ và tên", placeholder: "Nhập họ và tên", required: true },
	{ key: "university", label: "Trường đại học", placeholder: "" },
	{ key: "major", label: "Chuyên ngành", placeholder: "" },
	{ key: "graduation_year", label: "Năm tốt nghiệp", placeholder: "", type: "number" },
	{ key: "address", label: "Địa chỉ", placeholder: "Thành phố bạn đang sinh sống" },
];

function getInitials(name) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(-2)
		.map((part) => part[0])
		.join("")
		.toUpperCase() || "U";
}

export default function StudentProfile() {
	const { user } = useAuth();
	const savedProfile = JSON.parse(localStorage.getItem("student_profile") || "null");
	const [profile, setProfile] = useState({
		full_name: user?.full_name || "",
		university: "",
		major: "",
		graduation_year: "",
		address: "",
		bio: "",
		...savedProfile,
	});
	const [saved, setSaved] = useState(false);

	const completionFields = ["full_name", "university", "major", "graduation_year", "address", "bio"];
	const completedFields = completionFields.filter((field) => profile[field]?.toString().trim()).length;
	const completion = Math.round((completedFields / completionFields.length) * 100);

	const updateProfile = (field, value) => {
		setSaved(false);
		setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		localStorage.setItem("student_profile", JSON.stringify(profile));
		setSaved(true);
	};

	const displayName = profile.full_name || user?.email?.split("@")[0] || "Sinh viên";

	return (
		<main className="student-profile-page">
			<div className="container py-4 py-lg-5">
				<div className="profile-breadcrumb mb-3">
					<Link to="/student/dashboard">Dashboard</Link>
					<i className="bi bi-chevron-right"></i>
					<span>Hồ sơ cá nhân</span>
				</div>

				<div className="profile-heading mb-4">
					<div>
						<span className="profile-eyebrow">HỒ SƠ SINH VIÊN</span>
						<h1>Thông tin cá nhân</h1>
						<p>Cập nhật hồ sơ để nhà tuyển dụng hiểu rõ hơn về bạn.</p>
					</div>
					<div className="profile-completion-badge">
						<strong>{completion}%</strong>
						<span>Hoàn thiện hồ sơ</span>
					</div>
				</div>

				<div className="row g-4 align-items-start">
					<div className="col-lg-8">
						<form className="profile-panel" onSubmit={handleSubmit}>
							<div className="profile-panel-heading">
								<div>
									<h2>Thông tin cơ bản</h2>
									<p>Các thông tin này giúp kết nối bạn với cơ hội phù hợp.</p>
								</div>
								<i className="bi bi-person-vcard"></i>
							</div>

							<div className="profile-avatar-row">
								<div className="profile-avatar">{getInitials(displayName)}</div>
								<div>
									<strong>{displayName}</strong>
									<span>{user?.email}</span>
								</div>
							</div>

							<div className="row g-3">
								{profileFields.map((field) => (
									<div className={field.key === "address" ? "col-12" : "col-md-6"} key={field.key}>
										<label className="form-label" htmlFor={`profile-${field.key}`}>
											{field.label}{field.required && <span className="text-danger"> *</span>}
										</label>
										<input
											id={`profile-${field.key}`}
											className="form-control profile-input"
											type={field.type || "text"}
											placeholder={field.placeholder}
											value={profile[field.key]}
											onChange={(event) => updateProfile(field.key, event.target.value)}
											required={field.required}
										/>
									</div>
								))}
								<div className="col-12">
									<label className="form-label" htmlFor="profile-bio">Giới thiệu bản thân</label>
									<textarea
										id="profile-bio"
										className="form-control profile-input"
										placeholder="Chia sẻ ngắn về mục tiêu, kỹ năng hoặc định hướng nghề nghiệp của bạn..."
										rows="5"
										value={profile.bio}
										onChange={(event) => updateProfile("bio", event.target.value)}
									/>
								</div>
							</div>

							<div className="profile-form-footer">
								{saved && <span className="profile-saved"><i className="bi bi-check-circle-fill"></i> Đã lưu thay đổi</span>}
								<button className="btn profile-save-button" type="submit">
									<i className="bi bi-check2 me-2"></i>Lưu hồ sơ
								</button>
							</div>
						</form>
					</div>

					<div className="col-lg-4">
						<aside className="profile-side-column">
							<section className="profile-panel completion-panel">
								<div className="completion-header">
									<div className="completion-icon"><i className="bi bi-stars"></i></div>
									<div><h2>Mức độ hoàn thiện</h2><p>{completion >= 80 ? "Hồ sơ của bạn đã khá đầy đủ." : "Hoàn thiện thêm để tăng cơ hội được chú ý."}</p></div>
								</div>
								<div className="progress profile-progress" role="progressbar" aria-label="Mức độ hoàn thiện hồ sơ" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100">
									<div className="progress-bar" style={{ width: `${completion}%` }}></div>
								</div>
								<div className="completion-caption"><span>{completedFields}/{completionFields.length} mục đã hoàn thành</span><strong>{completion}%</strong></div>
							</section>

							<section className="profile-panel cv-panel">
								<div className="side-panel-icon"><i className="bi bi-file-earmark-pdf"></i></div>
								<h2>Quản lý CV</h2>
								<p>Tải CV lên để nhà tuyển dụng có thể xem kinh nghiệm và kỹ năng của bạn.</p>
								<Link to="/student/dashboard?tab=cv" className="btn cv-button">Đi đến quản lý CV <i className="bi bi-arrow-up-right ms-1"></i></Link>
							</section>

							<section className="profile-tip">
								<i className="bi bi-lightbulb"></i>
								<div><strong>Mẹo nhỏ</strong><p>Một phần giới thiệu rõ ràng và ngắn gọn sẽ giúp hồ sơ của bạn nổi bật hơn.</p></div>
							</section>
						</aside>
					</div>
				</div>
			</div>
		</main>
	);
}
