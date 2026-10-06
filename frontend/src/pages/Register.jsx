import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { isNativeMobileApp } from "../utils/platform";
import ReCAPTCHA from "../components/common/ReCAPTCHA";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import BrandLogo from "../components/common/BrandLogo";
import { requestEmailOtp, verifyEmailOtp } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "mine_official",
    phone: "",
    employeeId: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [otp, setOtp] = useState("");
  const [developmentOtp, setDevelopmentOtp] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { register, isLoading, token } = useAuthStore();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const t = translations[language];
  const isNativeApp =
    isNativeMobileApp() ||
    Capacitor.isNativePlatform() ||
    (typeof window !== "undefined" &&
      (Boolean(window.Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === "capacitor:" ||
        window.location.protocol === "ionic:"));
  const recaptchaSiteKey =
    !isNativeApp &&
    (import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
      (import.meta.env.DEV ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" : ""));

  useEffect(() => {
    if (token) {
      navigate("/app", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setOtp("");
      setOtpSent(false);
      setDevelopmentOtp("");
      setEmailVerificationToken("");
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const { data } = await requestEmailOtp({ email: form.email.trim() });
      setOtpSent(true);
      setDevelopmentOtp(data.verificationCode || "");
      toast.success(
        data.verificationCode
          ? "Verification code displayed below"
          : "Verification code sent to your email",
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 503
          ? "Email service is not configured. Add email settings to backend/.env."
          : "Unable to send verification code");
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = async (e) => {
    const code = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(code);
    if (code.length !== 6 || isVerifyingOtp || emailVerificationToken) return;

    setIsVerifyingOtp(true);
    try {
      const { data } = await verifyEmailOtp({ email: form.email.trim(), code });
      setEmailVerificationToken(data.emailVerificationToken);
      toast.success("Email verified");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Incorrect verification code",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNativeApp && recaptchaSiteKey && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim(),
      employeeId: form.employeeId.trim(),
      department: form.department.trim(),
      emailVerificationToken,
      recaptchaToken,
    };

    if (!emailVerificationToken) {
      toast.error("Verify your email before creating an account");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const result = await register(payload);

    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/app", { replace: true });
    } else {
      toast.error(result.message);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 pt-[var(--status-banner-height)] dark:bg-slate-950">
      <div className="relative hidden h-full overflow-hidden text-white lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(15,118,110,0.42)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.28),transparent_28%)]" />

        <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-8 xl:p-12">
          <div>
            <div className="mb-12">
              <BrandLogo imageClassName="h-16 w-48 rounded" />
            </div>

            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
              {language === "en" ? "Register access" : "पंजीकरण एक्सेस"}
            </div>

            <h2 className="mb-5 max-w-lg text-4xl font-black leading-tight">
              {language === "en"
                ? "Build a safer, smarter mining operation."
                : "एक सुरक्षित और स्मार्ट खदान संचालन बनाएं।"}
            </h2>
            <p className="max-w-md text-lg leading-8 text-slate-200">
              {language === "en"
                ? "Join the command center for mine inspections, compliance tracking, and operational intelligence."
                : "खदान निरीक्षण, अनुपालन ट्रैकिंग और परिचालन बौद्धिकता के लिए कमांड सेंटर में शामिल हों।"}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "secure",
                text:
                  language === "hi"
                    ? "सुरक्षित परिचालन एक्सेस बनाएं"
                    : "Create secure operational access",
              },
              {
                id: "deadlines",
                text:
                  language === "hi"
                    ? "नियामक समय-सीमा रियल टाइम में ट्रैक करें"
                    : "Track regulatory deadlines in real time",
              },
              {
                id: "coordinate",
                text:
                  language === "hi"
                    ? "एक प्लेटफ़ॉर्म से खदान टीमों का समन्वय करें"
                    : "Coordinate mine teams from one platform",
              },
            ].map(({ id, text }) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-3 backdrop-blur-sm"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span
                  className={`text-sm text-slate-100 ${language === "hi" ? "hindi-copy" : ""}`}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-xl">
            <div className="card p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-700 transition hover:text-[#0d3f6b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d3f6b] dark:text-slate-300 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {language === "hi"
                    ? "लैंडिंग पेज पर वापस जाएं"
                    : "Back to landing page"}
                </Link>
                <Link
                  to="/login"
                  className="shrink-0 text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                >
                  {language === "hi" ? "साइन इन" : "Sign in"}
                </Link>
              </div>
              <div className="mb-3 text-center">
                <h2 className="mb-0.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {language === "hi" ? "खाता बनाएं" : "Create account"}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                  {language === "hi"
                    ? "खदान हितधारक के रूप में पंजीकरण करें"
                    : "Register as a mine stakeholder"}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="register-name">
                      Full name
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="email">
                      Email address
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field min-w-0 flex-1"
                        placeholder="you@cil.gov.in"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={
                          isSendingOtp ||
                          !/^\S+@\S+\.\S+$/.test(form.email.trim()) ||
                          Boolean(emailVerificationToken)
                        }
                        className={`shrink-0 rounded-lg px-3 text-xs sm:text-sm font-semibold transition ${emailVerificationToken ? "bg-emerald-100 text-emerald-700" : "bg-[#0d3f6b] text-white hover:bg-[#092f52] disabled:cursor-not-allowed disabled:opacity-50"}`}
                      >
                        {emailVerificationToken ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isSendingOtp ? (
                          "Sending..."
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {otpSent && !emailVerificationToken && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                    {developmentOtp && (
                      <p
                        className="mb-1.5 text-xs text-amber-900 dark:text-amber-200"
                        role="status"
                      >
                        Development verification code:{" "}
                        <strong>{developmentOtp}</strong>
                      </p>
                    )}
                    <input
                      id="email-otp"
                      name="emailOtp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={handleOtpChange}
                      className="input-field tracking-[0.3em] text-center"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      autoComplete="one-time-code"
                      aria-label="Email verification code"
                    />
                    <p className="mt-1 text-center text-[11px] text-slate-500">
                      {isVerifyingOtp
                        ? "Verifying code..."
                        : "Code expires in 10 minutes."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="phone">
                      Phone number (optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="register-role">
                      Role
                    </label>
                    <select
                      id="register-role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="mine_official">Mine Official</option>
                      <option value="corporate">Corporate</option>
                      <option value="admin">Admin</option>
                      <option value="regulator">Regulator</option>
                      <option value="contractor">Contractor</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>
                </div>

                {form.role === "worker" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="employeeId">
                        Employee ID
                      </label>
                      <input
                        id="employeeId"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="EMP-001"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="department">
                        Department
                      </label>
                      <input
                        id="department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Operations"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="register-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="input-field pr-10"
                      placeholder="Create a strong password"
                      minLength={6}
                      aria-describedby="register-password-requirement"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p
                    id="register-password-requirement"
                    className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                  >
                    At least 6 characters ({form.password.length}/6)
                  </p>

                {!isNativeApp && recaptchaSiteKey ? (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={recaptchaSiteKey}
                    onChange={setRecaptchaToken}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                ) : !isNativeApp && import.meta.env.PROD ? (
                  <p className="text-sm text-red-600" role="alert">
                    Account verification is not configured. Set
                    VITE_RECAPTCHA_SITE_KEY.
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (!isNativeApp && recaptchaSiteKey && !recaptchaToken)
                  }
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="mt-3 text-center text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "hi"
                  ? "क्या आपका खाता पहले से है?"
                  : "Already have an account?"}{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary-700 hover:text-primary-800"
                >
                  {language === "hi" ? "साइन इन" : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
