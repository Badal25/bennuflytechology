import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/bennufly-mark.png.asset.json";
import lockupAsset from "@/assets/bennufly-lockup.png.asset.json";

export const BENNUFLY_MARK = markAsset.url;
export const BENNUFLY_LOCKUP = lockupAsset.url;

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <img
      src={BENNUFLY_MARK}
      alt="Bennufly Technology logo"
      className={`${className} object-contain`}
      width={512}
      height={512}
    />
  );
}

export function LogoLockup({ className = "h-24" }: { className?: string }) {
  return (
    <img
      src={BENNUFLY_LOCKUP}
      alt="Bennufly Technology Pvt. Ltd."
      className={`${className} w-auto object-contain`}
      loading="lazy"
    />
  );
}

export function Wordmark({
  to = "/",
  compact = false,
}: {
  to?: string;
  compact?: boolean;
}) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2.5" aria-label="Bennufly Technology home">
      <LogoMark className={compact ? "size-8" : "size-10"} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-[15px] font-extrabold tracking-tight">
          BENNU<span className="text-gradient">FLY</span>
        </span>
        {!compact && (
          <span className="mt-1 text-[9px] font-semibold tracking-[0.28em] text-muted-foreground">
            TECHNOLOGIES
          </span>
        )}
      </span>
    </Link>
  );
}