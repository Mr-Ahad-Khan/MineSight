export default function BrandLogo({ className = "", imageClassName = "" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent p-0 ${imageClassName} ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}minesight-logo.svg`}
        alt="MineSight"
        loading="eager"
        className="block h-full w-full object-cover"
      />
    </div>
  );
}
