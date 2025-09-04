import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface TargetMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TargetMappingModal({ isOpen, onClose }: TargetMappingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Target Mapping
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
          {/* Team Members Section */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Team: Arun/Anusha</Label>
              <Select>
                <SelectTrigger className="w-full bg-gray-50 rounded">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arun">Arun</SelectItem>
                  <SelectItem value="anusha">Anusha</SelectItem>
                  <SelectItem value="both">Both Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-red-500 mb-2 block">
                Team Members *
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">1.</span>
                  <span className="text-sm text-gray-800 font-medium">Umar</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-20 h-8 bg-gray-100 rounded">
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

                <div className="flex items-center gap-2">
                  <span className="w-6"></span>
                  <div className="flex items-center gap-2 flex-1">
                    <Select>
                      <SelectTrigger className="flex-1 bg-gray-50 rounded">
                        <SelectValue placeholder="Sarah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah</SelectItem>
                        <SelectItem value="john">John</SelectItem>
                        <SelectItem value="mike">Mike</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="flex-1 bg-gray-100 rounded">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6"></span>
                  <Input 
                    placeholder="Skill Required"
                    className="flex-1 bg-gray-50 rounded"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6"></span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">₹</span>
                    <Input 
                      placeholder="Number(INR)"
                      className="flex-1 bg-gray-100 rounded"
                    />
                  </div>
                </div>
              </div>
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