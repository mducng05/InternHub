import { useEffect, useState } from "react";
import { patchMe } from "../api/auth";
import { useAuth } from "../store/AuthContext";
import "./AccountAvatarSettings.css";

function getInitial(name, email) {
  return (name || email || "U").trim().charAt(0).toUpperCase();
}

export default function AccountAvatarSettings() {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    setError("");
    setSaved(false);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("Ảnh đại diện không được vượt quá 5MB.");
      return;
    }
    setFile(selected);
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const payload = new FormData();
    payload.append("avatar", file);
    try {
      const { data } = await patchMe(payload);
      updateUser({ avatar: data.avatar });
      setFile(null);
      setSaved(true);
    } catch (saveError) {
      const response = saveError.response?.data;
      setError(response?.avatar?.[0] || response?.detail || "Không thể lưu ảnh đại diện.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await patchMe({ avatar: null });
      updateUser({ avatar: null });
      setFile(null);
      setSaved(true);
    } catch (removeError) {
      setError(removeError.response?.data?.detail || "Không thể xóa ảnh đại diện.");
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = preview || user?.avatar;

  return (
    <section className="account-avatar-settings" aria-labelledby="account-avatar-title">
      <div className="account-avatar-settings__heading">
        <div>
          <h2 id="account-avatar-title">Ảnh đại diện</h2>
          <p>Ảnh này hiển thị bên cạnh tài khoản của bạn.</p>
        </div>
        <i className="bi bi-camera" aria-hidden="true" />
      </div>

      <div className="account-avatar-settings__content">
        <div className="account-avatar-preview" aria-label="Ảnh đại diện xem trước">
          {displayedAvatar ? (
            <img alt="Ảnh đại diện tài khoản" src={displayedAvatar} />
          ) : (
            <span>{getInitial(user?.full_name, user?.email)}</span>
          )}
        </div>
        <div className="account-avatar-settings__controls">
          <label className="account-avatar-pick">
            <i className="bi bi-image" aria-hidden="true" />
            Chọn ảnh
            <input accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} type="file" />
          </label>
          {file && (
            <button className="account-avatar-save" disabled={saving} onClick={handleSave} type="button">
              <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check2"}`} aria-hidden="true" />
              {saving ? "Đang lưu..." : "Lưu ảnh"}
            </button>
          )}
          {user?.avatar && !file && (
            <button className="account-avatar-remove" disabled={saving} onClick={handleRemove} type="button">
              <i className="bi bi-trash3" aria-hidden="true" /> Xóa ảnh
            </button>
          )}
          <span className="account-avatar-hint">JPG, PNG hoặc WebP · tối đa 5MB</span>
        </div>
      </div>

      {error && <p className="account-avatar-message is-error" role="alert">{error}</p>}
      {saved && <p className="account-avatar-message is-success" role="status">Ảnh đại diện đã được cập nhật.</p>}
    </section>
  );
}