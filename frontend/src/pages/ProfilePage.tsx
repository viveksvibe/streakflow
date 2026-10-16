import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constant";

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (fullName !== user?.fullName) {
      formData.append("fullName", fullName);
    }
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    // Only update if something changed
    if (formData.has("fullName") || formData.has("avatar")) {
      await updateProfile(formData);
    }
  };

  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#e8faf6] to-white pt-24 pb-12 px-5 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-black/5 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-text-dark" />
          </button>
          <h1 className="text-2xl font-bold text-text-dark">Profile Settings</h1>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-sf-teal/20">
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
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                >
                  <Camera size={28} className="text-white" />
                </button>

                {/* Edit Badge (visible without hover on mobile) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-text-dark hover:text-sf-teal transition-colors sm:hidden"
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
              <p className="text-sm text-text-dark-secondary">
                Click to update photo
              </p>
            </div>

            <hr className="border-black/[0.06]" />

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[0.85rem] font-semibold text-text-dark-secondary mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50 border border-black/[0.06] rounded-2xl px-4 py-3.5 text-[0.95rem] text-text-dark font-medium focus:outline-none focus:ring-2 focus:ring-sf-teal/20 focus:border-sf-teal/50 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-text-dark-secondary mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-gray-100 border border-black/[0.04] rounded-2xl px-4 py-3.5 text-[0.95rem] text-text-dark-secondary font-medium cursor-not-allowed"
                />
                <p className="text-xs text-text-dark-secondary/70 mt-1.5 ml-1">
                  Email address cannot be changed.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (fullName === user?.fullName && !avatarFile)
                }
                className="w-full h-[52px] bg-text-dark text-white rounded-2xl font-semibold text-[0.95rem] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.2)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
};

export default ProfilePage;
