import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { compressImageToBase64 } from "../lib/imageUtils";

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, updateUserProfile, loading } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split("@")[0] || "");
      setPhotoBase64(user.photoURL || null);
      setStatusMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setStatusMessage(null);
    try {
      const base64 = await compressImageToBase64(file, 240, 0.8);
      setPhotoBase64(base64);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to process image" });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const res = await updateUserProfile({
      displayName: displayName.trim(),
      photoURL: photoBase64,
    });

    if (res.success) {
      setStatusMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to update profile" });
    }
  };

  return (
    <div className="fixed inset-0 z-999 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-title font-bold text-lg">Profile Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-light-title font-bold bg-background px-2.5 py-1.5 rounded-sm cursor-pointer hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 group">
              <img
                src={photoBase64 || defaultAvatar}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              />
              <label
                htmlFor="settings-avatar-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition"
              >
                <span className="text-xs font-semibold">Change</span>
              </label>
              <input
                id="settings-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <label
              htmlFor="settings-avatar-upload"
              className="text-xs text-blue-600 font-semibold mt-2 cursor-pointer hover:underline"
            >
              {photoLoading ? "Compressing..." : "Change Photo"}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="settings-name" className="text-xs font-semibold text-title">
              Display Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-title">Email</label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="border border-slate-200 bg-slate-100 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          {statusMessage && (
            <p
              className={`text-xs text-center font-medium ${
                statusMessage.type === "success" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {statusMessage.text}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || photoLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md cursor-pointer transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
