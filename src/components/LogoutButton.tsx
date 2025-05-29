import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const LogoutButton = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      
      // Navigate to home page after successful logout
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred during sign out."
      });
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="shadow-lg flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
