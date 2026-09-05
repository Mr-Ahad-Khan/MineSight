import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Save, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { getMediaUrl } from "../services/api";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

export default function Profile() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    getMediaUrl(user?.profilePicture),
  );

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile pictures must be smaller than 5 MB");
      return;
    }
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };
    if (form.password) payload.password = form.password;

    const requestData = profilePicture ? new FormData() : payload;
    if (profilePicture) {
      Object.entries(payload).forEach(([key, value]) =>
        requestData.append(key, value),
      );
      requestData.append("profilePicture", profilePicture);
      if (form.password) requestData.append("password", form.password);
    }

    const result = await updateProfile(requestData);
    if (result.success) {
      toast.success("Profile updated successfully");
      setForm((current) => ({ ...current, password: "" }));
      setProfilePicture(null);
      setPreviewUrl(getMediaUrl(result.user?.profilePicture));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0d3f6b] dark:text-sky-300"
      >
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-[#0c3f6d] px-6 py-7 text-white dark:border-slate-700">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/40"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                <UserCircle className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{t.profileSettings}</h1>
              <p className="mt-1 text-sm text-slate-200">{t.manageAccount}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-700">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d9e7f4] text-[#0d3f6b] dark:bg-slate-700 dark:text-sky-300">
                <UserCircle className="h-11 w-11" />
              </div>
            )}
            <div>
              <label
                htmlFor="profilePicture"
                className="btn-secondary inline-flex cursor-pointer items-center gap-2"
              >
                <Camera className="h-4 w-4" /> {t.addProfilePicture}
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="sr-only"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                PNG, JPG, or GIF up to 5 MB
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                {t.fullName}
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label" htmlFor="role">
                {t.accountType}
              </label>
              <input
                id="role"
                value={user?.role?.replace("_", " ") || ""}
                className="input-field capitalize"
                disabled
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <label className="label" htmlFor="password">
              {t.newPassword}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              minLength={6}
              placeholder="Leave blank to keep your current password"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />{" "}
              {isLoading ? t.loading : t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
