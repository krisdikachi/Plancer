"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, LogOut, Menu, X, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface NavbarProps {
  currentRole?: "planner" | "attend";
}

export default function Navbar({ currentRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"planner" | "attend" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    getUser();
  }, []);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  const handleRoleSwitch = () => {
    const newRole = userRole === "planner" ? "attend" : "planner";
    setUserRole(newRole);
    
    // Update user role in database
    if (user) {
      supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id);
    }
    
    // Navigate to appropriate dashboard
    router.push(newRole === "planner" ? "/planner" : "/attend");
    setIsMobileMenuOpen(false);
  };

  const isPlannerPage = pathname?.startsWith("/planner");
  const isAttendPage = pathname?.startsWith("/attend");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Badge */}
          <div className="flex items-center gap-2 md:gap-4">
            <h1 
              className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-tight cursor-pointer"
              onClick={() => router.push("/")}
            >
              Plan<span className="text-emerald-500">cer</span>
            </h1>
            {userRole && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs md:text-sm hidden sm:inline-flex">
                {userRole === "planner" ? "Event Planner" : "Attendee"} Dashboard
              </Badge>
            )}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                {/* Role Switch Button */}
                <Button
                  onClick={handleRoleSwitch}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Switch to {userRole === "planner" ? "Attendee" : "Planner"}
                </Button>

                {/* Analytics Link (only for planners) */}
                {userRole === "planner" && (
                  <Button
                    onClick={() => router.push("/planner/analytics")}
                    variant={pathname === "/planner/analytics" ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl"
                  >
                    📊 Analytics
                  </Button>
                )}

                {/* Profile Button */}
                <Button
                  onClick={() => router.push("/profile")}
                  variant={pathname === "/profile" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </Button>

                {/* QR Generator Button (only for planners) */}
                {userRole === "planner" && (
                  <Button
                    onClick={() => router.push("/planner/scanner")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scanner
                  </Button>
                )}

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-3">
              {/* Role Switch Button */}
              <Button
                onClick={handleRoleSwitch}
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                Switch to {userRole === "planner" ? "Attendee" : "Planner"}
              </Button>

              {/* Analytics Link (only for planners) */}
              {userRole === "planner" && (
                <Button
                  onClick={() => {
                    router.push("/planner/analytics");
                    setIsMobileMenuOpen(false);
                  }}
                  variant={pathname === "/planner/analytics" ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start rounded-xl"
                >
                  📊 Analytics
                </Button>
              )}

              {/* Profile Button */}
              <Button
                onClick={() => {
                  router.push("/profile");
                  setIsMobileMenuOpen(false);
                }}
                variant={pathname === "/profile" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start rounded-full p-2"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
                <span className="ml-2">Profile</span>
              </Button>

              {/* QR Generator Button (only for planners) */}
              {userRole === "planner" && (
                <Button
                  onClick={() => {
                    router.push("/planner/scanner");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scanner
                </Button>
              )}

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 