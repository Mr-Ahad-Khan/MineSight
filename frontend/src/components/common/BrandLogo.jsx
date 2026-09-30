import { Link } from "react-router-dom";

export default function BrandLogo({ className = "", imageClassName = "" }) {
  return (
    <Link
      to="/app"
      aria-label="MineSight dashboard"
      title="Dashboard"
      onClick={(event) => event.stopPropagation()}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent p-0 ${imageClassName} ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}minesight-logo.svg`}
        alt="MineSight logo"
        loading="eager"
        className="block h-full w-full object-contain"
      />
    </Link>
  );
}
