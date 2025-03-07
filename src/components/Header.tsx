
import { Button } from '@/components/ui/button';
import { FileText, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  onViewPDF: () => void;
}

const Header = ({ onViewPDF }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mb-8 relative pt-12">
      {isMobile ? (
        <div className="fixed right-4 top-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-foreground hover:text-foreground/80 border-white/10 shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[280px]">
              <SheetHeader className="mb-4">
                <SheetTitle>Options</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={onViewPDF}
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="absolute right-6 top-6 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onViewPDF}
                  className="text-foreground hover:text-foreground/80 border-white/10 shadow-sm"
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View PDF</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  className="text-foreground hover:text-destructive border-white/10 shadow-sm"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Container Pass
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Data Entry System
        </p>
      </div>
    </div>
  );
};

export default Header;
