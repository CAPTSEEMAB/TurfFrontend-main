import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, User, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };
  return (
    <nav className="sticky top-0 z-50 w-full glass-strong border-b border-border/50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="rounded-xl gradient-primary p-2.5 shadow-glow transition-spring group-hover:scale-110">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              TurfBook
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/turfs" 
              className="text-sm font-medium transition-spring hover:text-primary relative group"
            >
              All Turfs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link 
              to="/players" 
              className="text-sm font-medium transition-spring hover:text-primary relative group"
            >
              All Players
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium transition-spring hover:text-primary relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 transition-spring hover:scale-105"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-2 transition-spring hover:scale-105">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
            <Link to="/turfs">
              <Button 
                size="sm" 
                className="shadow-primary gradient-primary hover:shadow-glow transition-spring hover:scale-105"
              >
                Book Now
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden transition-spring hover:scale-105">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
