import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail, Phone, Calendar } from "lucide-react";

interface EmployeeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    fathersName: string;
    joiningDate: string;
    employeeStatus: string;
    ctc: string;
  };
}

export default function EmployeeDetailsModal({ open, onOpenChange, employee }: EmployeeDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    fathersName: employee?.fathersName || "",
    joiningDate: employee?.joiningDate || "",
    employeeStatus: employee?.employeeStatus || "Permanent",
    ctc: employee?.ctc || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: string) => {
    handleInputChange("joiningDate", date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide" data-testid="dialog-employee-details">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Employee Name"
                  data-testid="input-employee-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fathersName" className="text-sm font-medium">Father's Name</Label>
                <Input
                  id="fathersName"
                  value={formData.fathersName}
                  onChange={(e) => handleInputChange("fathersName", e.target.value)}
                  placeholder="Father's Name"
                  data-testid="input-fathers-name"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="employee@example.com"
                  data-testid="input-employee-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone Number"
                  data-testid="input-employee-phone"
                />
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employment Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joiningDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Joining
                </Label>
                <DatePicker
                  value={formData.joiningDate}
                  onChange={handleDateChange}
                  placeholder="DD-MM-YYYY"
                  maxDate={new Date()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeStatus" className="text-sm font-medium">Employee Status</Label>
                <select
                  id="employeeStatus"
                  value={formData.employeeStatus}
                  onChange={(e) => handleInputChange("employeeStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white text-sm"
                  data-testid="select-employee-status"
                >
                  <option value="Intern">Intern</option>
                  <option value="Probation">Probation</option>
                  <option value="Permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctc" className="text-sm font-medium">Current CTC</Label>
              <Input
                id="ctc"
                type="text"
                value={formData.ctc}
                onChange={(e) => handleInputChange("ctc", e.target.value)}
                placeholder="Enter CTC amount"
                data-testid="input-ctc"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-employee"
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // Handle save logic here
                onOpenChange(false);
              }}
              data-testid="button-save-employee"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
