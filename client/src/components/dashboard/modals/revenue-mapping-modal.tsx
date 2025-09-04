import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface RevenueMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RevenueMappingModal({ isOpen, onClose }: RevenueMappingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Revenue Mapping
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Talent Advisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advisor1">Talent Advisor 1</SelectItem>
                  <SelectItem value="advisor2">Talent Advisor 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead1">Team Lead 1</SelectItem>
                  <SelectItem value="lead2">Team Lead 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Q1</SelectItem>
                  <SelectItem value="q2">Q2</SelectItem>
                  <SelectItem value="q3">Q3</SelectItem>
                  <SelectItem value="q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">Client 1</SelectItem>
                  <SelectItem value="client2">Client 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input placeholder="Offered Date" className="bg-gray-100 rounded" />
            </div>
          </div>

          {/* Fifth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input placeholder="Closure Date" className="bg-gray-50 rounded" />
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Percentage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sixth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-1">
              <span className="text-red-500 text-sm">*</span>
              <span className="text-sm text-gray-600">₹</span>
              <Input placeholder="Revenue" className="flex-1 bg-gray-50 rounded" />
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Incentive Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan1">Plan 1</SelectItem>
                  <SelectItem value="plan2">Plan 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seventh Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input placeholder="Incentive" className="bg-gray-50 rounded" />
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Eighth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="naukri">Naukri</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full bg-gray-100 rounded">
                  <SelectValue placeholder="Invoice Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ninth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input placeholder="Invoice Number" className="bg-gray-50 rounded" />
            </div>
            <div>
              <Input placeholder="Received Payment" className="bg-gray-100 rounded" />
            </div>
          </div>

          {/* Tenth Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input placeholder="Payment Details" className="bg-gray-50 rounded" />
            </div>
            <div>
              <Input placeholder="Incentive Disbursed Date" className="bg-gray-100 rounded" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              className="w-full bg-teal-400 hover:bg-teal-500 text-black font-medium py-2 rounded"
              onClick={onClose}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}