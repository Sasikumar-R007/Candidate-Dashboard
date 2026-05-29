import { cn } from "@/lib/utils";

const STR_ROLE_ID_PATTERN = /^STR\d{5}$/;

export function resolveAssetUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${window.location.origin}${trimmed}`;
  }
  return `${window.location.origin}/${trimmed.replace(/^\//, "")}`;
}

type CompanyBrandAvatarProps = {
  logoUrl?: string | null;
  companyName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
  xl: "h-20 w-20 text-3xl",
};

export function CompanyBrandAvatar({
  logoUrl,
  companyName,
  size = "md",
  className,
}: CompanyBrandAvatarProps) {
  const resolvedLogo = resolveAssetUrl(logoUrl);
  const initial =
    companyName && companyName !== "Loading..." && companyName.trim()
      ? companyName.trim().charAt(0).toUpperCase()
      : "C";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-md",
        sizeClasses[size],
        className,
      )}
    >
      {resolvedLogo ? (
        <img
          src={resolvedLogo}
          alt={companyName ? `${companyName} logo` : "Company logo"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
