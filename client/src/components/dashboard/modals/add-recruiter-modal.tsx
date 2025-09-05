import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface AddRecruiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
}

export default function AddRecruiterModal({ isOpen, onClose, editData, onSubmit }: AddRecruiterModalProps) {
  const [formData, setFormData] = useState({
    firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
    lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
    phoneNumber: editData?.phoneNumber || "",
    email: editData?.email || "",
    password: editData?.password || "",
    joiningDate: editData?.joiningDate || "",
    linkedinProfile: editData?.linkedinProfile || "",
    reportingTo: editData?.reportingTo || "",
  });

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setFormData({
        firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
        lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
        phoneNumber: editData?.phoneNumber || "",
        email: editData?.email || "",
        password: editData?.password || "",
        joiningDate: editData?.joiningDate || "",
        linkedinProfile: editData?.linkedinProfile || "",
        reportingTo: editData?.reportingTo || "",
      });
    }
  }, [editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      id: editData?.id || `STA${String(Date.now()).slice(-3)}`,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: "Recruiter"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      joiningDate: "",
      linkedinProfile: "",
      reportingTo: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-lg shadow-lg my-4">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {editData ? "Edit Recruiter" : "Add New Recruiter"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="First name"
              required
              className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
              data-testid="input-first-name"
            />
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Last name"
              required
              className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
              data-testid="input-last-name"
            />
          </div>

          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="Enter phone number"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-phone-number"
          />

          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-email"
          />

          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter password"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-password"
          />

          <div className="relative">
            <Input
              id="joiningDate"
              type="text"
              value={formData.joiningDate}
              onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
              placeholder="dd-mm-yyyy"
              className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500 pr-10"
              data-testid="input-joining-date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Input
            id="linkedinProfile"
            type="url"
            value={formData.linkedinProfile}
            onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})}
            placeholder="LinkedIn URL"
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-linkedin-profile"
          />

          <Select value={formData.reportingTo} onValueChange={(value) => setFormData({...formData, reportingTo: value})}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500" data-testid="select-reporting-to">
              <SelectValue placeholder="Select Team Leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STL001">Sundar Raj</SelectItem>
              <SelectItem value="STL002">Kavitha M</SelectItem>
              <SelectItem value="STL003">Vignesh T</SelectItem>
              <SelectItem value="STL004">Sasikumar R</SelectItem>
              <SelectItem value="STL005">Saran K</SelectItem>
              <SelectItem value="STL006">Azzim M</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 rounded bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-add"
            >
{editData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}