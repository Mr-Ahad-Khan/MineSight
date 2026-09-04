export default function BrandLogo({ className = "", imageClassName = "" }) {
  return (
    <img
      src="/minesight-logo.svg"
      alt="MineSight"
      className={`object-contain ${imageClassName} ${className}`}
    />
  );
}
