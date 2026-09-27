import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { patchStudentProfile } from "../api/profile";
import "./StudentCVStudio.css";

const TEMPLATES = [
  { id: "classic", label: "Tối giản", icon: "bi-file-earmark-text", hint: "Một cột, dễ đọc" },
  { id: "modern", label: "Hiện đại", icon: "bi-stars", hint: "Nhấn mạnh kỹ năng" },
  { id: "professional", label: "Chuyên nghiệp", icon: "bi-award", hint: "Cấu trúc rõ ràng" },
];

const ROLES = [
  ["backend", "Backend Developer Intern"],
  ["frontend", "Frontend Developer Intern"],
  ["business", "Nhân viên kinh doanh"],
  ["accounting", "Kế toán / Tài chính"],
  ["marketing", "Marketing Intern"],
  ["data", "Data Analyst Intern"],
  ["design", "UI/UX Designer Intern"],
  ["tester", "Tester / QA Intern"],
];

function defaultDraft(profile, user) {
  return {
    fullName: profile?.full_name || user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    university: profile?.university || "",
    major: profile?.major || "",
    targetRole: "backend",
    summary: profile?.bio || "",
    skills: "",
    experience: "",
    projects: "",
  };
}

function readDraft(key, fallback) {
  try {
    return { ...fallback, ...(JSON.parse(localStorage.getItem(key) || "null") || {}) };
  } catch {
    return fallback;
  }
}

function lines(value) {
  return (value || "").split("\n").map((line) => line.trim()).filter(Boolean);
}

function fileName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop());
  } catch {
    return url?.split("/").pop() || "CV đã tải lên";
  }
}

export default function StudentCVStudio({ profile, user, initialMode = "builder", onProfileUpdate }) {
  const [searchParams] = useSearchParams();
  const draftKey = `student_cv_draft_${user?.id || "guest"}`;
  const [draft, setDraft] = useState(() => readDraft(draftKey, defaultDraft(profile, user)));
  const [template, setTemplate] = useState(searchParams.get("style") || "classic");
  const [mode, setMode] = useState(initialMode);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const currentFile = profile?.cv_file || "";

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      fullName: current.fullName || profile?.full_name || user?.full_name || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || "",
      university: current.university || profile?.university || "",
      major: current.major || profile?.major || "",
      summary: current.summary || profile?.bio || "",
    }));
  }, [profile, user]);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, draftKey]);

  useEffect(() => {
    const requestedStyle = searchParams.get("style");
    const requestedRole = searchParams.get("role");
    const requestedMode = searchParams.get("mode");
    const requestedTab = searchParams.get("tab");
    if (TEMPLATES.some((item) => item.id === requestedStyle)) setTemplate(requestedStyle);
    if (ROLES.some(([id]) => id === requestedRole)) setDraft((current) => ({ ...current, targetRole: requestedRole }));
    if (requestedMode === "manage" || requestedTab === "resume" || initialMode === "upload") setMode("upload");
    else if (requestedStyle || requestedRole || requestedTab === "cv") setMode("builder");
  }, [initialMode, searchParams]);

  const roleLabel = ROLES.find(([id]) => id === draft.targetRole)?.[1] || ROLES[0][1];

  const updateField = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError("");
    setUploadMessage("");
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) return setUploadError("Chỉ nhận CV định dạng PDF, DOC hoặc DOCX.");
    if (file.size > 10 * 1024 * 1024) return setUploadError("CV không được vượt quá 10MB.");

    setUploading(true);
    const payload = new FormData();
    payload.append("cv_file", file);
    try {
      const { data } = await patchStudentProfile(payload);
      onProfileUpdate?.(data);
      setUploadMessage("CV đã được tải lên hồ sơ của bạn.");
    } catch (error) {
      setUploadError(error.response?.data?.cv_file?.[0] || error.response?.data?.detail || "Không tải được CV. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = async () => {
    setUploading(true);
    setUploadError("");
    setUploadMessage("");
    try {
      const { data } = await patchStudentProfile({ cv_file: null });
      onProfileUpdate?.(data);
      setUploadMessage("Đã xóa CV khỏi hồ sơ.");
    } catch {
      setUploadError("Không xóa được CV. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const resetDraft = () => {
    setDraft(defaultDraft(profile, user));
    setTemplate("classic");
    localStorage.removeItem(draftKey);
  };

  return (
    <section className="student-cv-studio">
      <header className="student-cv-heading">
        <div><span className="student-cv-eyebrow">CV STUDIO · SINH VIÊN</span><h2>Tạo và quản lý CV</h2><p>Dựng bản CV theo phong cách và vị trí mục tiêu, hoặc tải file CV sẵn có lên hồ sơ.</p></div>
        <Link to="/student/profile" className="student-cv-profile-link"><i className="bi bi-person-vcard" aria-hidden="true" /> Hồ sơ cá nhân</Link>
      </header>

      <div className="student-cv-mode-tabs" role="tablist" aria-label="CV cá nhân">
        <button aria-selected={mode === "builder"} className={mode === "builder" ? "is-active" : ""} onClick={() => setMode("builder")} role="tab" type="button"><i className="bi bi-pencil-square" aria-hidden="true" /> Tạo CV</button>
        <button aria-selected={mode === "upload"} className={mode === "upload" ? "is-active" : ""} onClick={() => setMode("upload")} role="tab" type="button"><i className="bi bi-folder2-open" aria-hidden="true" /> CV đã tải lên</button>
      </div>

      {mode === "upload" ? (
        <section className="student-cv-upload-panel" role="tabpanel">
          <div className="student-cv-upload-icon"><i className="bi bi-cloud-arrow-up" aria-hidden="true" /></div>
          <div className="student-cv-upload-content"><span className="student-cv-eyebrow">HỒ SƠ TRÊN TÀI KHOẢN</span><h3>{currentFile ? "CV hiện tại" : "Tải CV lên"}</h3>
            {currentFile ? <a className="student-cv-current-file" href={currentFile} rel="noreferrer" target="_blank"><i className="bi bi-file-earmark-pdf" aria-hidden="true" />{fileName(currentFile)}<i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a> : <p>Chưa có CV trên hồ sơ. Tải lên PDF, DOC hoặc DOCX, tối đa 10MB.</p>}
          </div>
          <div className="student-cv-upload-actions">
            <label className="student-cv-button student-cv-button--primary"><i className={`bi ${uploading ? "bi-arrow-repeat" : "bi-upload"}`} aria-hidden="true" />{uploading ? "Đang tải..." : currentFile ? "Thay CV" : "Chọn file CV"}<input accept=".pdf,.doc,.docx" disabled={uploading} onChange={handleUpload} type="file" /></label>
            {currentFile && <button className="student-cv-button student-cv-button--remove" disabled={uploading} onClick={removeUpload} type="button"><i className="bi bi-trash3" aria-hidden="true" /> Xóa CV</button>}
          </div>
          {uploadError && <p className="student-cv-message is-error" role="alert">{uploadError}</p>}
          {uploadMessage && <p className="student-cv-message is-success" role="status">{uploadMessage}</p>}
          <div className="student-cv-upload-help"><i className="bi bi-info-circle" aria-hidden="true" /><span>CV tải lên sẽ được dùng khi bạn ứng tuyển. Bản CV đang dựng ở tab “Tạo CV” là bản nháp riêng trên trình duyệt.</span></div>
        </section>
      ) : (
        <div className="student-cv-builder" role="tabpanel">
          <section className="student-cv-editor">
            <div className="student-cv-section-heading"><div><span className="student-cv-eyebrow">BẢN NHÁP CÁ NHÂN</span><h3>Nội dung CV</h3></div><button className="student-cv-reset" onClick={resetDraft} type="button">Làm mới</button></div>
            <div className="student-cv-template-picker" role="group" aria-label="Chọn phong cách CV">{TEMPLATES.map((item) => <button aria-pressed={template === item.id} className={template === item.id ? "is-selected" : ""} key={item.id} onClick={() => setTemplate(item.id)} type="button"><i className={`bi ${item.icon}`} aria-hidden="true" /><span>{item.label}</span><small>{item.hint}</small></button>)}</div>
            <div className="student-cv-fields">
              <label><span>Họ và tên</span><input name="fullName" onChange={updateField} value={draft.fullName} /></label>
              <label><span>Email</span><input name="email" onChange={updateField} type="email" value={draft.email} /></label>
              <label><span>Số điện thoại</span><input name="phone" onChange={updateField} value={draft.phone} /></label>
              <label><span>Vị trí mục tiêu</span><select name="targetRole" onChange={updateField} value={draft.targetRole}>{ROLES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
              <label><span>Trường / đơn vị đào tạo</span><input name="university" onChange={updateField} value={draft.university} /></label>
              <label><span>Chuyên ngành</span><input name="major" onChange={updateField} value={draft.major} /></label>
              <label className="student-cv-fields__wide"><span>Mục tiêu nghề nghiệp</span><textarea name="summary" onChange={updateField} rows="3" value={draft.summary} /></label>
              <label className="student-cv-fields__wide"><span>Kỹ năng <small>mỗi kỹ năng một dòng</small></span><textarea name="skills" onChange={updateField} placeholder="Python&#10;SQL&#10;Làm việc nhóm" rows="4" value={draft.skills} /></label>
              <label className="student-cv-fields__wide"><span>Kinh nghiệm / hoạt động <small>mỗi mục một dòng</small></span><textarea name="experience" onChange={updateField} placeholder="Vai trò — đơn vị — thời gian: mô tả đóng góp và kết quả" rows="4" value={draft.experience} /></label>
              <label className="student-cv-fields__wide"><span>Dự án tiêu biểu <small>mỗi dự án một dòng</small></span><textarea name="projects" onChange={updateField} placeholder="Tên dự án — vai trò — công nghệ — kết quả" rows="4" value={draft.projects} /></label>
            </div>
            <div className="student-cv-editor-footer"><span><i className="bi bi-device-ssd" aria-hidden="true" /> Bản nháp tự lưu trên trình duyệt này</span><button className="student-cv-button student-cv-button--primary" onClick={() => window.print()} type="button"><i className="bi bi-printer" aria-hidden="true" /> Tải CV PDF</button></div>
          </section>
          <section className="student-cv-preview" aria-label="Xem trước CV"><article className={`student-cv-paper student-cv-paper--${template}`}>
            <header><span className="student-cv-paper-eyebrow">CURRICULUM VITAE</span><h2>{draft.fullName || "Họ và tên của bạn"}</h2><p>{ROLES.find(([id]) => id === draft.targetRole)?.[1]}</p><div><span>{draft.email || "email@example.com"}</span>{draft.phone && <span>{draft.phone}</span>}</div></header>
            {(draft.summary || draft.university || draft.major) && <section><h3>Giới thiệu</h3><p>{draft.summary || [draft.major, draft.university].filter(Boolean).join(" · ")}</p>{draft.university && <small>{draft.major ? `${draft.major} · ` : ""}{draft.university}</small>}</section>}
            {lines(draft.skills).length > 0 && <section><h3>Kỹ năng</h3><ul>{lines(draft.skills).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul></section>}
            {lines(draft.experience).length > 0 && <section><h3>Kinh nghiệm &amp; hoạt động</h3><ul>{lines(draft.experience).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul></section>}
            {lines(draft.projects).length > 0 && <section><h3>Dự án</h3><ul>{lines(draft.projects).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul></section>}
          </article></section>
          <p className="student-cv-note">Khi chọn “Tải CV PDF”, trong hộp thoại in hãy chọn lưu thành PDF.</p>
        </div>
      )}
    </section>
  );
}