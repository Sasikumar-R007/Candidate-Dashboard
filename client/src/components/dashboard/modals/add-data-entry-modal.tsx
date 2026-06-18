import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface AddDataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export default function AddDataEntryModal({
  isOpen,
  onClose,
  editData,
  onSubmit,
  isSubmitting = false,
}: AddDataEntryModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    joiningDate: "",
  });
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (editData) {
      const nameParts = (editData.name || "").split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phoneNumber: editData.phone || editData.phoneNumber || "",
        email: editData.email || "",
        password: "",
        joiningDate: editData.joiningDate || "",
      });
      setJoiningDate(editData.joiningDate ? new Date(editData.joiningDate) : undefined);
    } else if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        joiningDate: "",
      });
      setJoiningDate(undefined);
    }
  }, [editData, isOpen]);

  const handleClose = () => {
    if (!editData) {
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        joiningDate: "",
      });
      setJoiningDate(undefined);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    onSubmit({
      dbId: editData?.id,
      employeeId: editData?.employeeId,
      name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      joiningDate: formData.joiningDate,
      role: "data_entry",
    });
  };

  const inputClassName =
    "h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:ring-slate-200";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="mx-auto my-4 max-w-lg overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pb-3 pt-6">
          <DialogTitle className="text-[1.35rem] font-semibold text-slate-900">
            {editData ? "Edit Data Entry User" : "Add Data Entry User"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2 text-xs leading-5 text-slate-500">
          Creates a login for the Resume Upload Hub. A welcome email with credentials will be sent to the user.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
              required
              className={inputClassName}
              data-testid="input-data-entry-first-name"
            />
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
              required
              className={inputClassName}
              data-testid="input-data-entry-last-name"
            />
          </div>

          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            required
            className={inputClassName}
            data-testid="input-data-entry-email"
          />

          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="Phone number"
            className={inputClassName}
            data-testid="input-data-entry-phone"
          />

          <PasswordInput
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editData ? "New password (leave blank to keep)" : "Password"}
            required={!editData}
            className={inputClassName}
            data-testid="input-data-entry-password"
          />

          <div className="space-y-2">
            <Label htmlFor="data-entry-joining-date" className="text-sm font-medium text-slate-700">
              Joining date
            </Label>
            <p className="text-xs text-slate-500">Date this user started in the Data Entry role.</p>
            <StandardDatePicker
              value={joiningDate}
              onChange={(date) => {
                setJoiningDate(date);
                setFormData({
                  ...formData,
                  joiningDate: date ? format(date, "yyyy-MM-dd") : "",
                });
              }}
              placeholder="Select joining date"
              className={`w-full ${inputClassName}`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
              data-testid="button-submit-data-entry"
            >
              {isSubmitting ? "Saving..." : editData ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
