import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin";

// Define response types to help with proper typing
type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type UserData = {
  id: number;
  username: string;
  isAdmin: boolean;
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated and is admin
  const {
    data: userApiResponse,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<ApiResponse<UserData>>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Extract user data from API response
  const userData = userApiResponse?.data;

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (isUserError) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin panel",
      });
      setLocation("/login");
    } else if (userData && !userData.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [userData, isUserError, toast, setLocation]);

  // If user is not authenticated or not admin, don't render anything
  if (isUserError || (userData && !userData.isAdmin)) {
    return null;
  }

  return <AdminLayout />;
}
