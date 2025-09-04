import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

interface AddTalentAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
}

export default function AddTalentAdvisorModal({ isOpen, onClose, editData, onSubmit }: AddTalentAdvisorModalProps) {
  const [formData, setFormData] = useState({
    id: editData?.id || "",
    name: editData?.name || "",
    email: editData?.email || "",
    phone: editData?.phone || "",
    specialization: editData?.specialization || "",
    teamLead: editData?.teamLead || "",
    joiningDate: editData?.joiningDate || "",
    experience: editData?.experience || "",
    targetClosures: editData?.targetClosures || "",
    status: editData?.status || "Active"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      id: formData.id || `STTA${String(Date.now()).slice(-3)}`,
      role: "Talent Advisor"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      specialization: "",
      teamLead: "",
      joiningDate: "",
      experience: "",
      targetClosures: "",
      status: "Active"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {editData ? "Edit Talent Advisor" : "Add Talent Advisor"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter full name"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter phone number"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="specialization" className="text-sm font-medium text-gray-700 mb-2 block">
              Specialization
            </Label>
            <Select value={formData.specialization} onValueChange={(value) => setFormData({...formData, specialization: value})}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Roles</SelectItem>
                <SelectItem value="non-technical">Non-Technical Roles</SelectItem>
                <SelectItem value="leadership">Leadership Roles</SelectItem>
                <SelectItem value="sales">Sales & Marketing</SelectItem>
                <SelectItem value="finance">Finance & Accounting</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="teamLead" className="text-sm font-medium text-gray-700 mb-2 block">
              Reports To (Team Lead)
            </Label>
            <Select value={formData.teamLead} onValueChange={(value) => setFormData({...formData, teamLead: value})}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arun KS">Arun KS</SelectItem>
                <SelectItem value="Anusha">Anusha</SelectItem>
                <SelectItem value="Sundhar Raj">Sundhar Raj</SelectItem>
                <SelectItem value="Kavitha">Kavitha</SelectItem>
                <SelectItem value="Vignesh">Vignesh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="joiningDate" className="text-sm font-medium text-gray-700 mb-2 block">
              Joining Date
            </Label>
            <Input
              id="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
              Experience (Years)
            </Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Years of experience"
              min="0"
              max="50"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="targetClosures" className="text-sm font-medium text-gray-700 mb-2 block">
              Target Closures (Monthly)
            </Label>
            <Input
              id="targetClosures"
              type="number"
              value={formData.targetClosures}
              onChange={(e) => setFormData({...formData, targetClosures: e.target.value})}
              placeholder="Target closures per month"
              min="1"
              max="50"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editData ? "Update" : "Add"} Talent Advisor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}