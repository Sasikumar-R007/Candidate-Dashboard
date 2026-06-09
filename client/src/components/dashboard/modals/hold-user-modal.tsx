import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";

export type HoldDurationType = "minutes" | "hours" | "days" | "resume_date" | "indefinite";

export type HoldUserPayload = {
  holdMessage: string;
  durationType: HoldDurationType;
  durationValue?: number;
  resumeDate?: string;
};

interface HoldUserModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (payload: HoldUserPayload) => void;
}

export default function HoldUserModal({
  isOpen,
  userName,
  userEmail,
  isSubmitting,
  onClose,
  onConfirm,
}: HoldUserModalProps) {
  const [holdMessage, setHoldMessage] = useState(
    "Your StaffOS access has been temporarily suspended by an administrator. Please contact your admin for assistance.",
  );
  const [durationType, setDurationType] = useState<HoldDurationType>("hours");
  const [durationValue, setDurationValue] = useState("24");
  const [resumeDate, setResumeDate] = useState<Date | undefined>(undefined);

  const isValid = useMemo(() => {
    if (!holdMessage.trim()) return false;
    if (durationType === "minutes" || durationType === "hours" || durationType === "days") {
      const n = parseFloat(durationValue);
      return Number.isFinite(n) && n > 0;
    }
    if (durationType === "resume_date") {
      return Boolean(resumeDate);
    }
    return true;
  }, [holdMessage, durationType, durationValue, resumeDate]);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      holdMessage: holdMessage.trim(),
      durationType,
      durationValue:
        durationType === "minutes" || durationType === "hours" || durationType === "days"
          ? parseFloat(durationValue)
          : undefined,
      resumeDate:
        durationType === "resume_date" && resumeDate
          ? resumeDate.toISOString()
          : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Hold User — Confirmation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <p className="font-medium">You are about to hold:</p>
            <p className="mt-1 font-semibold">{userName}</p>
            <p className="text-amber-800">{userEmail}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-amber-900">
              <li>The user will be blocked from StaffOS profile login and dashboard access.</li>
              <li>If they are currently logged in, they will see a 30-second alert and be logged out automatically.</li>
              <li>The hold message below will be shown to the user on their next login attempt.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label>Message shown to user</Label>
            <Textarea
              value={holdMessage}
              onChange={(e) => setHoldMessage(e.target.value)}
              className="min-h-[90px] bg-slate-50 border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hold duration</Label>
              <Select
                value={durationType}
                onValueChange={(v) => setDurationType(v as HoldDurationType)}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="resume_date">Resume on date</SelectItem>
                  <SelectItem value="indefinite">Until Admin resumes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(durationType === "minutes" ||
              durationType === "hours" ||
              durationType === "days") && (
              <div className="space-y-1.5">
                <Label>
                  {durationType === "minutes"
                    ? "Minutes"
                    : durationType === "hours"
                      ? "Hours"
                      : "Days"}
                </Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            )}

            {durationType === "resume_date" && (
              <div className="space-y-1.5 col-span-2">
                <Label>Resume on</Label>
                <StandardDatePicker
                  value={resumeDate}
                  onChange={setResumeDate}
                  placeholder="Select resume date"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={!isValid || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Holding…" : "Confirm Hold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
