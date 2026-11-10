import { useState, useRef, useCallback, memo } from "react";
import { useAuthStore, type User } from "../store/authStore";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constant";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return <ProfileForm key={user.id} user={user} />;
};

const ProfileForm = memo(({ user }: { user: User }) => {
  const { updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user.fullName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (fullName !== user.fullName) {
      formData.append("fullName", fullName);
    }
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    if (formData.has("fullName") || formData.has("avatar")) {
      await updateProfile(formData);
    }
  }, [fullName, avatarFile, user.fullName, updateProfile]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const goBack = useCallback(() => navigate(ROUTES.HOME), [navigate]);

  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-[100dvh] bg-page pt-24 pb-12 px-5 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-line shadow-sm hover:bg-well transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
          <h1 className="text-2xl font-bold text-ink">Profile Settings</h1>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-surface rounded-3xl p-6 sm:p-8 shadow-[var(--sf-card-shadow)] border border-line"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-on-brand text-4xl font-bold shadow-lg shadow-sf-teal/20">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </div>

                {/* Edit overlay */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                >
                  <Camera size={28} className="text-white" />
                </button>

                {/* Edit Badge (visible without hover on mobile) */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-surface shadow-md border border-line flex items-center justify-center text-ink-mid hover:text-brand transition-colors sm:hidden cursor-pointer"
                >
                  <Camera size={16} />
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-ink-mute">
                Click to update photo
              </p>
            </div>

            <hr className="border-line" />

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[0.85rem] font-semibold text-ink-mid mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={handleNameChange}
                  placeholder="Enter your full name"
                  className="w-full bg-well border border-line rounded-2xl px-4 py-3.5 text-[0.95rem] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand-ring/20 focus:border-brand-ring transition-all placeholder:text-ink-mute"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-ink-mid mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-well border border-line rounded-2xl px-4 py-3.5 text-[0.95rem] text-ink-mute font-medium cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-ink-mute mt-1.5 ml-1">
                  Email address cannot be changed.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (fullName === user.fullName && !avatarFile)
                }
                className="w-full h-[52px] bg-ink text-on-brand rounded-2xl font-semibold text-[0.95rem] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-on-brand/30 border-t-on-brand rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
})

ProfileForm.displayName = 'ProfileForm'

export default ProfilePage;
