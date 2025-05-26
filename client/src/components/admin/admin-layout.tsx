import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, Download, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProductsTab } from "./products-tab";
import { DownloadsTab } from "./downloads-tab";
import { ContactsTab } from "./contacts-tab";

type TabType = "products" | "downloads" | "contacts";

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

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<TabType>("products");
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

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  // If loading user data, show loading spinner
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not admin, don't render the page (will be redirected)
  if (userData && !userData.isAdmin) {
    return null;
  }

  const sidebarItems = [
    {
      id: "products" as TabType,
      label: "Products",
      icon: Package,
    },
    {
      id: "downloads" as TabType,
      label: "Downloads",
      icon: Download,
    },
    {
      id: "contacts" as TabType,
      label: "Contacts",
      icon: Users,
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "products":
        return <ProductsTab />;
      case "downloads":
        return <DownloadsTab />;
      case "contacts":
        return <ContactsTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {userData?.username || "Admin"}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-muted/30 border-r">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
} 