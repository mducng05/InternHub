import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchIndustries } from "../api/catalog";
import { getEmployerProfile, patchEmployerProfile } from "../api/profile";
import { useAuth } from "../store/AuthContext";
import AccountAvatarSettings from "../components/AccountAvatarSettings";
import "./EmployerProfile.css";

const COMPANY_SIZES = [
	["1-50", "1-50 nhân viên"],
	["51-200", "51-200 nhân viên"],
	["201-1000", "201-1000 nhân viên"],
	["1000+", "Trên 1000 nhân viên"],
];

const EMPTY_PROFILE = {
	full_name: "",
	email: "",
	phone: "",
	company_name: "",
	logo: "",
	industry: "",
	company_size: "",
	website: "",
	tax_code: "",
	address: "",
	description: "",
};

function getErrorMessage(error) {
	const data = error.response?.data;
	if (typeof data?.detail === "string") return data.detail;
	if (data && typeof data === "object") return Object.values(data).flat().join(" ");
	return "Không thể kết nối máy chủ. Vui lòng thử lại.";
}

export default function EmployerProfile() {
	const { updateUser } = useAuth();
	const [profile, setProfile] = useState(EMPTY_PROFILE);
	const [industries, setIndustries] = useState([]);
	const [isVerified, setIsVerified] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);
	const [logoFile, setLogoFile] = useState(null);
	const [logoPreview, setLogoPreview] = useState("");
	const [removeLogo, setRemoveLogo] = useState(false);

	useEffect(() => {
		if (!logoFile) return undefined;
		const previewUrl = URL.createObjectURL(logoFile);
		setLogoPreview(previewUrl);
		return () => URL.revokeObjectURL(previewUrl);
	}, [logoFile]);

	useEffect(() => {
		let isCurrent = true;
		Promise.all([getEmployerProfile(), fetchIndustries()])
			.then(([profileResponse, industriesResponse]) => {
				if (!isCurrent) return;
				const data = profileResponse.data;
				setProfile({
					full_name: data.full_name || "",
					email: data.email || "",
					phone: data.phone || "",
					company_name: data.company_name || "",
					logo: data.logo || "",
					industry: data.industry ? String(data.industry) : "",
					company_size: data.company_size || "",
					website: data.website || "",
					tax_code: data.tax_code || "",
					address: data.address || "",
					description: data.description || "",
				});
				setIsVerified(Boolean(data.is_verified));
				setIndustries(Array.isArray(industriesResponse.data) ? industriesResponse.data : industriesResponse.data?.results || []);
			})
			.catch((loadError) => {
				if (isCurrent) setError(getErrorMessage(loadError));
			})
			.finally(() => {
				if (isCurrent) setLoading(false);
			});

		return () => {
			isCurrent = false;
		};
	}, []);

	const updateField = (field, value) => {
		setSaved(false);
		setError("");
		setProfile((current) => ({ ...current, [field]: value }));
	};

	const handleLogoChange = (event) => {
		const selectedFile = event.target.files?.[0];
		event.target.value = "";
		if (!selectedFile) return;
		setSaved(false);
		setError("");
		if (!selectedFile.type.startsWith("image/")) {
			setError("Vui lòng chọn file logo dạng ảnh.");
			return;
		}
		if (selectedFile.size > 5 * 1024 * 1024) {
			setError("Logo công ty không được vượt quá 5MB.");
			return;
		}
		setLogoFile(selectedFile);
		setRemoveLogo(false);
	};

	const handleRemoveLogo = () => {
		setLogoFile(null);
		setLogoPreview("");
		setRemoveLogo(true);
		setSaved(false);
		setError("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);
		setError("");
		setSaved(false);

		const profilePayload = {
			...profile,
			full_name: profile.full_name.trim(),
			email: profile.email.trim(),
			phone: profile.phone.trim(),
			company_name: profile.company_name.trim(),
			industry: profile.industry || null,
			company_size: profile.company_size || "",
			website: profile.website.trim(),
			tax_code: profile.tax_code.trim(),
			address: profile.address.trim(),
			description: profile.description.trim(),
		};
		delete profilePayload.logo;
		const payload = new FormData();
		Object.entries(profilePayload).forEach(([key, value]) => {
			payload.append(key, value ?? "");
		});
		if (logoFile) payload.append("logo", logoFile);
		if (removeLogo) payload.append("remove_logo", "true");

		try {
			const { data } = await patchEmployerProfile(payload);
			setProfile((current) => ({ ...current, ...data, industry: data.industry ? String(data.industry) : "", logo: data.logo || "" }));
			setLogoFile(null);
			setLogoPreview("");
			setRemoveLogo(false);
			setIsVerified(Boolean(data.is_verified));
			updateUser({ full_name: data.full_name, email: data.email, phone: data.phone });
			setSaved(true);
		} catch (saveError) {
			setError(getErrorMessage(saveError));
		} finally {
			setSaving(false);
		}
	};

	return (
		<main className="employer-profile-page">
			<div className="employer-profile-page__inner">
				<div className="employer-profile-breadcrumb">
					<Link to="/employer/dashboard">Dashboard</Link>
					<i className="bi bi-chevron-right" aria-hidden="true" />
					<span>Cài đặt thông tin cá nhân</span>
				</div>

				<header className="employer-profile-header">
					<div>
						<span className="employer-profile-eyebrow">TÀI KHOẢN NHÀ TUYỂN DỤNG</span>
						<h1>Thông tin cá nhân</h1>
						<p>Cập nhật thông tin liên hệ và hồ sơ doanh nghiệp của bạn.</p>
					</div>
					<span className={`employer-profile-verification ${isVerified ? "is-verified" : "is-unverified"}`}>
						<i className={`bi ${isVerified ? "bi-patch-check-fill" : "bi-hourglass-split"}`} aria-hidden="true" />
						{isVerified ? "Đã xác minh" : "Chưa xác minh"}
					</span>
				</header>

				<form className="employer-profile-form" onSubmit={handleSubmit}>
					<AccountAvatarSettings />

					<section className="employer-profile-section">
						<div className="employer-profile-section__heading">
							<div>
								<h2>Thông tin liên hệ</h2>
								<p>Thông tin sử dụng để quản lý và liên hệ với tài khoản.</p>
							</div>
							<i className="bi bi-person-vcard" aria-hidden="true" />
						</div>
						<div className="employer-profile-grid">
							<div className="employer-company-logo-field employer-profile-field--wide">
								<span>Logo doanh nghiệp</span>
								<div className="employer-company-logo-editor">
									<div className="employer-company-logo-preview">
										{(logoPreview || (!removeLogo && profile.logo)) ? (
											<img alt="Logo doanh nghiệp xem trước" src={logoPreview || profile.logo} />
										) : <i className="bi bi-buildings" aria-hidden="true" />}
									</div>
									<div className="employer-company-logo-actions">
										<label className="employer-company-logo-pick">
											<i className="bi bi-image" aria-hidden="true" /> Chọn logo
											<input accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} type="file" />
										</label>
										{(profile.logo || logoFile) && !removeLogo && (
											<button className="employer-company-logo-remove" onClick={handleRemoveLogo} type="button">
												<i className="bi bi-trash3" aria-hidden="true" /> Xóa logo
											</button>
										)}
										<span>PNG, JPG hoặc WebP · tối đa 5MB</span>
									</div>
								</div>
							</div>
							<label className="employer-profile-field">
								<span>Họ và tên <b>*</b></span>
								<input autoComplete="name" maxLength={150} onChange={(event) => updateField("full_name", event.target.value)} required value={profile.full_name} />
							</label>
							<label className="employer-profile-field">
								<span>Email đăng nhập <b>*</b></span>
								<input autoComplete="email" onChange={(event) => updateField("email", event.target.value)} required type="email" value={profile.email} />
							</label>
							<label className="employer-profile-field">
								<span>Số điện thoại</span>
								<input autoComplete="tel" maxLength={20} onChange={(event) => updateField("phone", event.target.value)} type="tel" value={profile.phone} />
							</label>
							<div className="employer-profile-field employer-profile-password-link">
								<span>Bảo mật tài khoản</span>
								<Link to="/change-password"><i className="bi bi-shield-lock" aria-hidden="true" /> Đổi mật khẩu</Link>
							</div>
						</div>
					</section>

					<section className="employer-profile-section">
						<div className="employer-profile-section__heading">
							<div>
								<h2>Hồ sơ doanh nghiệp</h2>
								<p>Thông tin hiển thị trên trang tuyển dụng sau khi được duyệt.</p>
							</div>
							<i className="bi bi-buildings" aria-hidden="true" />
						</div>
						<div className="employer-profile-grid">
							<label className="employer-profile-field">
								<span>Tên doanh nghiệp <b>*</b></span>
								<input maxLength={255} onChange={(event) => updateField("company_name", event.target.value)} required value={profile.company_name} />
							</label>
							<label className="employer-profile-field">
								<span>Lĩnh vực hoạt động</span>
								<select onChange={(event) => updateField("industry", event.target.value)} value={profile.industry}>
									<option value="">Chọn lĩnh vực</option>
									{industries.map((industry) => <option key={industry.id} value={industry.id}>{industry.name}</option>)}
								</select>
							</label>
							<label className="employer-profile-field">
								<span>Quy mô doanh nghiệp</span>
								<select onChange={(event) => updateField("company_size", event.target.value)} value={profile.company_size}>
									<option value="">Chọn quy mô</option>
									{COMPANY_SIZES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
								</select>
							</label>
							<label className="employer-profile-field">
								<span>Website</span>
								<input onChange={(event) => updateField("website", event.target.value)} placeholder="https://example.com" type="url" value={profile.website} />
							</label>
							<label className="employer-profile-field">
								<span>Mã số thuế</span>
								<input maxLength={50} onChange={(event) => updateField("tax_code", event.target.value)} value={profile.tax_code} />
							</label>
							<label className="employer-profile-field">
								<span>Địa chỉ</span>
								<input maxLength={255} onChange={(event) => updateField("address", event.target.value)} value={profile.address} />
							</label>
							<label className="employer-profile-field employer-profile-field--wide">
								<span>Giới thiệu doanh nghiệp</span>
								<textarea onChange={(event) => updateField("description", event.target.value)} rows="5" value={profile.description} />
							</label>
						</div>
					</section>

					<div className="employer-profile-verification-note">
						<i className="bi bi-info-circle" aria-hidden="true" />
						Trạng thái xác minh do quản trị viên cập nhật và không thể tự chỉnh sửa tại đây.
					</div>

					{error && <p className="employer-profile-message is-error" role="alert">{error}</p>}
					{saved && <p className="employer-profile-message is-success" role="status">Đã lưu thông tin hồ sơ.</p>}

					<div className="employer-profile-actions">
						<Link className="employer-profile-back" to="/employer/dashboard">Quay lại dashboard</Link>
						<button className="employer-profile-save" disabled={loading || saving} type="submit">
							<i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check2"}`} aria-hidden="true" />
							{loading ? "Đang tải..." : saving ? "Đang lưu..." : "Lưu thay đổi"}
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
