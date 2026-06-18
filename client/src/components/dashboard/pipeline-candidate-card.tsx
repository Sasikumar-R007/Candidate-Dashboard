import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PIPELINE_CARD_RADIUS_PX } from "@/lib/pipeline-ui-tokens";
import { resolveProfilePictureUrl } from "@/lib/resolve-media-url";

type PipelineCandidateCardProps = {
  name: string;
  roleApplied: string;
  company?: string | null;
  subtitle?: string | null;
  timestamp?: string | null;
  profilePicture?: string | null;
  rejected?: boolean;
  clickable?: boolean;
  hasUnreadComments?: boolean;
  onClick?: () => void;
  testId?: string;
};

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** TA pipeline card — large radius, profile photo, reference layout. */
export function PipelineCandidateCard({
  name,
  roleApplied,
  company,
  subtitle,
  timestamp,
  profilePicture,
  rejected = false,
  clickable = false,
  hasUnreadComments = false,
  onClick,
  testId,
}: PipelineCandidateCardProps) {
  const avatarSrc = resolveProfilePictureUrl(profilePicture);
  const displayCompany = company || subtitle;

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{ borderRadius: PIPELINE_CARD_RADIUS_PX }}
      className={`relative border bg-white p-2 shadow-sm transition-all ${
        rejected ? "border-red-200 bg-red-50" : "border-gray-200"
      } ${clickable ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : ""}`}
      data-testid={testId}
    >
      {hasUnreadComments ? (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
          aria-label="Unread team messages"
        />
      ) : null}
      <div className="flex items-start gap-2.5">
        <Avatar className="h-9 w-9 shrink-0 border border-gray-100">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-blue-100 text-[11px] font-medium text-blue-700">
            {initialsFromName(name) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-[12px] font-semibold leading-tight text-gray-900">
            {name || "N/A"}
          </h4>
          <p className="truncate text-[10px] leading-snug text-gray-600">{roleApplied}</p>
          {(displayCompany || timestamp) && (
            <div className="mt-1 flex items-center justify-between gap-2">
              {displayCompany ? (
                <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  {displayCompany}
                </p>
              ) : (
                <span />
              )}
              {timestamp ? (
                <p className="shrink-0 text-[10px] text-gray-400">{timestamp}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
