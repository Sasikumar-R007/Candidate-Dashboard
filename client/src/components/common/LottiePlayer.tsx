import Lottie from "lottie-react";
import type { LottieComponentProps } from "lottie-react";

export type LottiePlayerProps = Pick<
  LottieComponentProps,
  "animationData" | "className"
>;

/**
 * Thin wrapper around `lottie-react` for consistent usage across the app.
 * Place Lottie JSON exports under `client/src/assets/animations/`.
 *
 * @example
 * ```tsx
 * import myAnimation from "@/assets/animations/my-animation.json";
 *
 * <LottiePlayer animationData={myAnimation} className="h-24 w-24" />
 * ```
 */
export function LottiePlayer({ animationData, className }: LottiePlayerProps) {
  return <Lottie animationData={animationData} className={className} />;
}
