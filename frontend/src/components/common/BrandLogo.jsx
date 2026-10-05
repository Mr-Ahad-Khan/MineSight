import { Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

export default function BrandLogo({
  className = "",
  imageClassName = "",
  darkSurface = false,
  forceLogo = null,
}) {
  const darkMode = useThemeStore((state) => state.darkMode);

  const logoFile =
    forceLogo ||
    (darkSurface || darkMode ? "minesight-logo.svg" : "minesight-logo-light.svg");

  return (
    <Link
      to="/app"
      aria-label="MineSight dashboard"
      title="Dashboard"
      onClick={(event) => event.stopPropagation()}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent p-0 ${imageClassName} ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}${logoFile}`}
        alt="MineSight logo"
        loading="eager"
        className="block h-full w-full object-contain"
      />
    </Link>
  );
}
