import { toast } from "@/hooks/use-toast";

const HOLD_LOGOUT_SECONDS = 30;

export function runAdminHoldCountdown(userName: string, onComplete?: () => void) {
  let secondsLeft = HOLD_LOGOUT_SECONDS;

  const countdownToast = toast({
    title: `Holding ${userName}`,
    description: `User will be logged out in ${secondsLeft} sec…`,
    duration: 120_000,
    className: "border-amber-300 bg-amber-50",
  });

  const interval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      countdownToast.update({
        id: countdownToast.id,
        title: `Holding ${userName}`,
        description: `User will be logged out in ${secondsLeft} sec…`,
        open: true,
      });
      return;
    }

    clearInterval(interval);
    countdownToast.dismiss();

    toast({
      title: "User held successfully",
      description: `${userName} has been placed on hold and logged out from StaffOS.`,
      duration: 6000,
      className: "border-green-300 bg-green-50",
    });

    onComplete?.();
  }, 1000);
}
