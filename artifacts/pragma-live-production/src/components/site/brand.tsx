import logo from "@/assets/brand/PRAGMA_Horizontal_Verde_Branco.svg";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`}
      src={logo}
      alt="PRAGMA Live Production"
      width={1050}
      height={240}
    />
  );
}
