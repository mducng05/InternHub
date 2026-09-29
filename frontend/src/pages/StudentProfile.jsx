import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { getStudentProfile, updateStudentProfile } from "../api/profile";
import { MBTI_IMAGES } from "../data/mbtiData";
import MbtiResultModal from "../components/MbtiResultModal";
import "./MbtiTest.css";
import "./StudentProfile.css";

const profileFields = [
	{ key: "full_name", label: "Họ và tên", placeholder: "Nhập họ và tên", required: true },
	{ key: "university", label: "Trường đại học", placeholder: "Trường đại học" },
	{ key: "major", label: "Chuyên ngành", placeholder: "Chuyên ngành" },
	{ key: "graduation_year", label: "Năm tốt nghiệp", placeholder: "Năm tốt nghiệp", type: "number" },
	{ key: "address", label: "Địa chỉ", placeholder: "Thành phố bạn đang sinh sống" },
];

function getInitials(name) {
	return (
		name
			.split(" ")
			.filter(Boolean)
			.slice(-2)
			.map((part) => part[0])
			.join("")
			.toUpperCase() || "U"
	);
}

export default function StudentProfile() {
	const { user, updateUser } = useAuth();
	const userProfileKey = user?.id ? `student_profile_${user.id}` : null;

	const [profile, setProfile] = useState({
		full_name: user?.full_name || "",
		university: "",
		major: "",
		graduation_year: "",
		address: "",
		bio: "",
	});
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	// MBTI Result state
	const [mbtiResult, setMbtiResult] = useState(() => {
		try {
			const saved = localStorage.getItem("internhub_mbti_result");
			return saved ? JSON.parse(saved) : null;
		} catch {
			return null;
		}
	});
	const [showMbtiModal, setShowMbtiModal] = useState(false);

	// Tải thông tin hồ sơ theo đúng tài khoản đăng nhập
	useEffect(() => {
		// Xoá key cũ không phân biệt tài khoản để tránh rò rỉ dữ liệu
		localStorage.removeItem("student_profile");

		if (!user?.id) return;

		// 1. Kiểm tra cache riêng của tài khoản hiện tại
		const cached = userProfileKey ? JSON.parse(localStorage.getItem(userProfileKey) || "null") : null;
		if (cached) {
			setProfile({
				full_name: cached.full_name || user.full_name || "",
				university: cached.university || "",
				major: cached.major || "",
				graduation_year: cached.graduation_year || "",
				address: cached.address || "",
				bio: cached.bio || "",
			});
		} else {
			setProfile({
				full_name: user.full_name || "",
				university: "",
				major: "",
				graduation_year: "",
				address: "",
				bio: "",
			});
		}

		// 2. Gọi API lấy dữ liệu thực tế từ database của tài khoản này
		let isCurrent = true;
		setLoading(true);
		getStudentProfile()
			.then(({ data }) => {
				if (isCurrent && data) {
					const profileData = {
						full_name: data.full_name || user.full_name || "",
						university: data.university || "",
						major: data.major || "",
						graduation_year: data.graduation_year || "",
						address: data.address || "",
						bio: data.bio || "",
					};
					setProfile(profileData);
					if (userProfileKey) {
						localStorage.setItem(userProfileKey, JSON.stringify(data));
					}
				}
			})
			.catch((err) => {
				console.warn("Không thể tải hồ sơ từ máy chủ:", err);
			})
			.finally(() => {
				if (isCurrent) setLoading(false);
			});

		return () => {
			isCurrent = false;
		};
	}, [user?.id, user?.full_name, userProfileKey]);

	const completionFields = ["full_name", "university", "major", "graduation_year", "address", "bio"];
	const completedFields = completionFields.filter((field) => profile[field]?.toString().trim()).length;
	const completion = Math.round((completedFields / completionFields.length) * 100);

	const updateField = (field, value) => {
		setSaved(false);
		setError("");
		setProfile((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);
		setError("");

		const payload = {
			full_name: profile.full_name.trim(),
			university: profile.university.trim(),
			major: profile.major.trim(),
			graduation_year: profile.graduation_year ? parseInt(profile.graduation_year, 10) : null,
			address: profile.address.trim(),
			bio: profile.bio.trim(),
			is_profile_complete: completion >= 80,
		};

		try {
			// Lưu vào cơ sở dữ liệu backend
			const { data } = await updateStudentProfile(payload);
			if (userProfileKey) {
				localStorage.setItem(userProfileKey, JSON.stringify(data));
			}

			// Cập nhật lại họ tên user chung trong hệ thống
			if (payload.full_name && updateUser) {
				updateUser({ full_name: payload.full_name });
			}

			setSaved(true);
			setTimeout(() => setSaved(false), 4000);
		} catch (err) {
			console.error("Lỗi khi cập nhật hồ sơ:", err);
			// Nếu server có lỗi kết nối, vẫn lưu vào cache riêng của tài khoản này
			if (userProfileKey) {
				localStorage.setItem(userProfileKey, JSON.stringify(payload));
			}
			setError("Không thể đồng bộ với máy chủ, dữ liệu tạm lưu trên trình duyệt của bạn.");
		} finally {
			setSaving(false);
		}
	};

	const displayName = profile.full_name || user?.email?.split("@")[0] || "Sinh viên";

	return (
		<main className="student-profile-page">
			<div className="container py-4 py-lg-5">
				<div className="profile-heading mb-4">
					<div>
						<h1>Thông tin cá nhân</h1>
						<p>Cập nhật hồ sơ để nhà tuyển dụng hiểu rõ hơn về bạn.</p>
					</div>
					<div className="profile-completion-badge">
						<strong>{completion}%</strong>
						<span>Hoàn thiện hồ sơ</span>
					</div>
				</div>

				<div className="row g-4 profile-main-row">
					<div className="col-lg-8">
						<form className="profile-panel profile-form-panel" onSubmit={handleSubmit}>
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

							{error && (
								<div className="alert alert-warning py-2 px-3 small mt-3" role="alert">
									<i className="bi bi-exclamation-triangle me-2" />
									{error}
								</div>
							)}

							<div className="profile-form-body">
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
												value={profile[field.key] || ""}
												onChange={(event) => updateField(field.key, event.target.value)}
												required={field.required}
												disabled={loading || saving}
											/>
										</div>
									))}
									<div className="col-12">
										<label className="form-label" htmlFor="profile-bio">Giới thiệu bản thân</label>
										<textarea
											id="profile-bio"
											className="form-control profile-input"
											placeholder="Chia sẻ ngắn về mục tiêu, kỹ năng hoặc định hướng nghề nghiệp của bạn..."
											rows="3"
											value={profile.bio || ""}
											onChange={(event) => updateField("bio", event.target.value)}
											disabled={loading || saving}
										/>
									</div>
								</div>
							</div>

							<div className="profile-form-footer">
								{saved && (
									<span className="profile-saved text-pink">
										<i className="bi bi-check-circle-fill me-1"></i> Đã lưu thay đổi vào hệ thống
									</span>
								)}
								<button className="btn profile-save-button" type="submit" disabled={loading || saving}>
									{saving ? (
										<>
											<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
											Đang lưu...
										</>
									) : (
										<>
											<i className="bi bi-check2 me-2"></i>Lưu hồ sơ
										</>
									)}
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

							<section className="profile-panel cv-panel">
								<div className="side-panel-icon"><i className="bi bi-shield-lock"></i></div>
								<h2>Bảo mật tài khoản</h2>
								<p>Đổi mật khẩu định kỳ để giữ an toàn cho tài khoản của bạn.</p>
								<Link to="/change-password" className="btn cv-button">Đổi mật khẩu <i className="bi bi-arrow-right ms-1"></i></Link>
							</section>

							<section className="profile-tip">
								<i className="bi bi-lightbulb"></i>
								<div><strong>Mẹo nhỏ</strong><p>Một phần giới thiệu rõ ràng và ngắn gọn sẽ giúp hồ sơ của bạn nổi bật hơn.</p></div>
							</section>
						</aside>
					</div>
				</div>

				{/* PHẦN KẾT QUẢ TRẮC NGHIỆM TÍNH CÁCH MBTI - ĐƯA XUỐNG DƯỚI */}
				{mbtiResult && (
					<div className="mbti-completed-banner mt-4 d-flex align-items-center gap-3 shadow-sm py-3 px-3 px-md-4">
						<img
							src={mbtiResult.image || MBTI_IMAGES[mbtiResult.type] || MBTI_IMAGES["INTJ"]}
							alt={mbtiResult.type}
							style={{
								width: "72px",
								height: "90px",
								objectFit: "contain",
								borderRadius: "12px",
								border: "1.5px solid #ffccd5",
								background: "#fff",
								padding: "3px",
								boxShadow: "0 4px 12px rgba(201, 24, 74, 0.08)",
								flexShrink: 0,
							}}
						/>
						<div className="flex-grow-1 d-flex flex-column justify-content-center text-start" style={{ minWidth: 0, textAlign: "left" }}>
							{/* Hàng 1: Nhóm tính cách bên trái & các nút thao tác bên phải */}
							<div className="d-flex align-items-center justify-content-between gap-3">
								<div className="d-flex align-items-center gap-2 flex-shrink-0 text-start">
									<span
										className="badge bg-pink text-white fw-bold px-2 py-0.5 rounded-pill"
										style={{ fontSize: "0.8rem", letterSpacing: "0.3px" }}
									>
										{mbtiResult.type}
									</span>
									<span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
										{mbtiResult.info?.name} <span className="text-secondary fw-normal">({mbtiResult.info?.englishTitle})</span>
									</span>
								</div>

								<div className="d-flex align-items-center gap-2 flex-shrink-0">
									<button
										type="button"
										className="btn btn-pink rounded-pill shadow-sm"
										style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0.32rem 0.85rem" }}
										onClick={() => setShowMbtiModal(true)}
									>
										<i className="bi bi-eye-fill me-1"></i> Xem kết quả
									</button>
									<Link
										to="/mbti-test"
										className="btn btn-outline-secondary rounded-pill"
										style={{ fontSize: "0.78rem", fontWeight: 500, padding: "0.32rem 0.75rem" }}
									>
										<i className="bi bi-arrow-repeat me-1"></i> Làm lại
									</Link>
								</div>
							</div>

							{/* Hàng 2: Dòng text căn lề trái, nằm ngay dưới nhóm tính cách */}
							<p
								className="text-secondary small mb-0 mt-2 text-truncate text-start"
								style={{ fontSize: "0.86rem", lineHeight: "1.4", textAlign: "left" }}
								title={mbtiResult.info?.tagline}
							>
								{mbtiResult.info?.tagline
									? `“${mbtiResult.info.tagline}”`
									: "Định hình thế mạnh tính cách và phong cách làm việc lý tưởng của bạn."}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Modal xem lại kết quả MBTI ngay trên trang hồ sơ */}
			<MbtiResultModal
				show={showMbtiModal}
				onHide={() => setShowMbtiModal(false)}
				result={mbtiResult}
			/>
		</main>
	);
}
