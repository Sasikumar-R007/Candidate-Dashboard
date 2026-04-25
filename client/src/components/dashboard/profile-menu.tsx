import { 
  Settings, HelpCircle, LogOut, ChevronDown 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfileMenuProps {
  name: string;
  candidateId: string;
  profilePicture?: string;
  onNavigateToSettings?: () => void;
  onOpenSupport?: () => void;
}

export default function ProfileMenu({ 
  name, 
  candidateId, 
  profilePicture, 
  onNavigateToSettings,
  onOpenSupport
}: ProfileMenuProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/candidate-logout');
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full pl-1.5 pr-5 py-1 shadow-sm hover:shadow-md transition-all active:scale-[0.98] outline-none group text-left">
          <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={profilePicture} className="object-cover" />
            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-base">
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {name || 'Loading...'}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              {candidateId || 'STCA000'}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors ml-1" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-none font-poppins">
        <DropdownMenuItem 
          onClick={onNavigateToSettings}
          className="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center text-gray-500">
            <Settings size={18} />
          </div>
          <span className="font-bold text-sm">Settings Page</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={onOpenSupport}
          className="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center text-gray-500">
            <HelpCircle size={18} />
          </div>
          <span className="font-bold text-sm">Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-gray-50" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center text-rose-500">
            <LogOut size={18} />
          </div>
          <span className="font-bold text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
