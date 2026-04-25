import { useLocation, Link } from "wouter";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  UserCircle,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCandidateAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { Input } from "@/components/ui/input";
import NotificationCenter from "./notification-center";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [location] = useLocation();
  const candidate = useCandidateAuth();
  const { data: profile } = useProfile();

  const getPageTitle = (path: string) => {
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    switch (lastPart) {
      case 'overview': return 'Executive Overview';
      case 'applications': return 'Application Nexus';
      case 'matches': return 'AI Match Engine';
      case 'profile': return 'Professional Identity';
      case 'resume': return 'Resume Intelligence';
      case 'settings': return 'System Settings';
      default: return 'Candidate Portal';
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-40 transition-all duration-300">
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-4 hover:bg-slate-100 rounded-full"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </Button>

      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 mr-2">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Portal</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:inline" />
        <h1 className="font-black text-slate-900 text-lg truncate tracking-tight">
          {getPageTitle(location)}
        </h1>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-3 md:gap-6">
        {/* Search - Hidden on Small Mobile */}
        <div className="relative hidden lg:block w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search matching roles..."
            className="pl-11 h-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-2xl text-xs font-medium border-transparent hover:border-slate-200 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 pl-4 pr-1.5 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all active:scale-95 group flex items-center gap-3">
              <Menu className="h-4 w-4 text-slate-500 group-hover:text-indigo-500 transition-colors" />
              <div className="relative">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={profile?.profilePicture || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-[10px] font-black uppercase">
                    {candidate?.fullName?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2 p-2 border-slate-200 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuLabel className="px-3 py-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Account</p>
              <p className="text-xs font-bold text-slate-900 truncate">{candidate?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2 mb-2" />
            <DropdownMenuItem className="cursor-pointer rounded-xl h-10 px-3 font-bold text-xs" asChild>
              <Link href="/candidate/profile">
                <div className="flex items-center w-full">
                  <UserCircle className="mr-3 h-4 w-4 text-slate-500" />
                  <span>My Identity Profile</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl h-10 px-3 font-bold text-xs" asChild>
              <Link href="/candidate/settings">
                <div className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4 text-slate-500" />
                  <span>System Preferences</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2 my-2" />
            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-xl h-10 px-3 font-bold text-xs">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
