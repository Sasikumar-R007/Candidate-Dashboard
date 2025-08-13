import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TeamLeaderProfile {
  name: string;
  role: string;
  employeeId: string;
  phone: string;
  email: string;
  joiningDate: string;
  department: string;
  reportingTo: string;
  totalContribution: string;
  bannerImage?: string | null;
  profilePicture?: string | null;
}

interface TeamLeaderEditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TeamLeaderProfile;
  onSave?: (updatedProfile: Partial<TeamLeaderProfile>) => void;
}

export default function TeamLeaderEditProfileModal({
  open,
  onOpenChange,
  profile,
  onSave
}: TeamLeaderEditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: profile.name.split(' ')[0] || '',
    lastName: profile.name.split(' ').slice(1).join(' ') || '',
    role: profile.role,
    employeeId: profile.employeeId,
    phone: profile.phone,
    email: profile.email,
    joiningDate: profile.joiningDate,
    department: profile.department,
    reportingTo: profile.reportingTo,
    totalContribution: profile.totalContribution
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: formData.role,
      employeeId: formData.employeeId,
      phone: formData.phone,
      email: formData.email,
      joiningDate: formData.joiningDate,
      department: formData.department,
      reportingTo: formData.reportingTo,
      totalContribution: formData.totalContribution
    };

    if (onSave) {
      onSave(updatedProfile);
    }

    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide" data-testid="modal-edit-team-leader-profile">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* View-Only Work Information - Top Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Work Information (View Only)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-readonly">Role</Label>
                <Input
                  id="role-readonly"
                  value={formData.role}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-role-readonly"
                  tabIndex={-1}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
              <div>
                <Label htmlFor="employeeId-readonly">Employee ID</Label>
                <Input
                  id="employeeId-readonly"
                  value={formData.employeeId}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-employee-id-readonly"
                />
              </div>
              <div>
                <Label htmlFor="joiningDate-readonly">Joining Date</Label>
                <Input
                  id="joiningDate-readonly"
                  value={formData.joiningDate}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-joining-date-readonly"
                />
              </div>
              <div>
                <Label htmlFor="department-readonly">Department</Label>
                <Input
                  id="department-readonly"
                  value={formData.department}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-department-readonly"
                />
              </div>
              <div>
                <Label htmlFor="reportingTo-readonly">Reporting To</Label>
                <Input
                  id="reportingTo-readonly"
                  value={formData.reportingTo}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-reporting-to-readonly"
                />
              </div>
              <div>
                <Label htmlFor="totalContribution-readonly">Total Contribution</Label>
                <Input
                  id="totalContribution-readonly"
                  value={formData.totalContribution}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  data-testid="input-total-contribution-readonly"
                />
              </div>
            </div>
          </div>

          {/* Editable Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  data-testid="input-last-name"
                />
              </div>
            </div>
          </div>

          {/* Editable Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  data-testid="input-email"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save-profile"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}