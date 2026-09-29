import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  EyeOff,
  Languages,
  Leaf,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import BrandLogo from "../components/common/BrandLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef(null);
  const { login, isLoading, token, user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const recaptchaSiteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    (import.meta.env.DEV
      ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      : "");
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") ||
    (user?.role === "worker" ? "/app/workers" : "/app");
  const destination = redirectTo.startsWith("/app") ? redirectTo : "/app";

  useEffect(() => {
    if (token) {
      navigate(destination, { replace: true });
    }
  }, [token, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recaptchaSiteKey && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA.");
      return;
    }

    const result = await login(email.trim(), password, recaptchaToken);
    if (result.success) {
      toast.success("Login successful!");
      navigate(destination, { replace: true });
    } else {
      toast.error(result.message);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  };

  const quickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 lg:flex-row">
      {/* Left panel */}
      <div className="relative hidden h-full overflow-hidden bg-[#071827] text-white lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(5,23,38,0.94) 0%, rgba(5,23,38,0.74) 42%, rgba(5,23,38,0.35) 100%), linear-gradient(0deg, rgba(5,23,38,0.86), transparent 58%), url('/coal-miners.webp')",
          }}
        />
        <div className="relative z-10 flex min-h-full w-full flex-col justify-between px-[8.5%] py-8 xl:px-14 xl:py-10">
          <div>
            <div className="mb-14 flex items-center justify-between gap-3">
              <BrandLogo imageClassName="h-16 w-64 rounded" />

              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-white/25 bg-black/20 p-1 text-[10px] font-bold tracking-wide text-white/75 transition hover:border-amber-300/70"
                aria-label="Change language"
                title="Change language"
              >
                <Languages className="mx-1 h-3.5 w-3.5 text-amber-300" />
                <span
                  className={`rounded-full px-2 py-1 ${language === "en" ? "bg-amber-400 text-slate-950" : ""}`}
                >
                  EN
                </span>
                <span
                  className={`rounded-full px-2 py-1 ${language === "hi" ? "bg-amber-400 text-slate-950" : ""}`}
                >
                  हिंदी
                </span>
              </button>
            </div>

            <h2 className="mb-4 max-w-[540px] whitespace-pre-line text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-[2.65rem]">
              {language === "en"
                ? "Smarter Monitoring\nfor a Safer Tomorrow"
                : "स्मार्ट निगरानी\nएक सुरक्षित कल के लिए"}
            </h2>
              <p className="max-w-[390px] whitespace-pre-line text-base leading-7 text-slate-200 xl:text-[17px]">
              {language === "en"
                ? "Coal MineSight helps you monitor, manage and\nimprove coal mine operations with real-time data,\nAI insights and collaborative tools."
                : "कोल माइनसाइट आपको वास्तविक समय के डेटा,\nएआई अंतर्दृष्टि और सहयोगी उपकरणों के साथ\nखदान संचालन की निगरानी और प्रबंधन में मदद करता है।"}
            </p>
          </div>

          <div className="grid max-w-[570px] grid-cols-4 gap-3 pb-1 sm:gap-6">
            {[
              [ShieldCheck, "Enhanced", "Safety"],
              [BarChart3, "Real-Time", "Monitoring"],
              [Leaf, "Efficient", "Resource Use"],
              [Users, "Better", "Collaboration"],
            ].map(([Icon, title, subtitle]) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-amber-400 text-amber-300 sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
                </div>
                <div className="text-xs font-medium leading-5 text-white sm:text-sm">
                  {title}
                  <br />
                  {subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToLanding}
          </Link>
          <div className="card p-5 sm:p-8">
            <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
              {t.welcomeBack}
            </h2>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
              {t.signInToAccount}
            </p>

            <form
              onSubmit={handleSubmit}
              autoComplete="on"
              className="space-y-4"
            >
              <div>
                <label className="label" htmlFor="login-email">
                  {t.email}
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@cil.gov.in"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="login-password">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
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

              {recaptchaSiteKey ? (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={setRecaptchaToken}
                  onExpired={() => setRecaptchaToken(null)}
                />
              ) : import.meta.env.PROD ? (
                <p className="text-sm text-red-600" role="alert">
                  Login verification is not configured. Set VITE_RECAPTCHA_SITE_KEY.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !recaptchaSiteKey}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  t.signIn
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs leading-5 text-slate-600 dark:text-slate-300">
              {t.signInHint}
            </p>

            {/* Optional seeded demo accounts */}
            <details className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
              <summary className="cursor-pointer text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.quickDemo} ({t.optional})
              </summary>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin("rajesh@ncl.gov.in", "mine123")}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.mineOfficial}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("corporate@cil.gov.in", "corp123")}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.corporate}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("admin@cil.gov.in", "admin123")}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.admin}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("regulator@dgms.gov.in", "reg123")}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.regulator}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("worker@cil.gov.in", "worker123")}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Worker demo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    quickLogin("ananya@shakticontractors.in", "contract123")
                  }
                  className="col-span-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {t.contractorDemo}
                </button>
              </div>

            </details>
            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
              {t.dontHaveAccount}{" "}
              <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
