export default function BrandLogo({ className = "", imageClassName = "" }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}minesight-logo.svg`}
      alt="MineSight"
      loading="eager"
      className={`block shrink-0 object-contain ${imageClassName} ${className}`}
    />
  );
}
