"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, LogOut, Menu, X, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
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
    <div className="w-full fixed top-[-13] left-0 right-0 z-50 px-4 py-3">
      {/* Floating Navbar Container */}
      <div className="max-w-6xl mx-auto">
        <div 
          className="relative backdrop-blur-xl bg-emerald/70 border border-white/20 shadow-lg
            rounded-bl-lg rounded-br-lg p-3 transition-all duration-300  hover:bg-white/80"
        >
          {/* Main Navbar Content */}
          <div className="flex items-center justify-between px-4">
            {/* Logo and Badge */}
            <div className="flex items-center gap-2 md:gap-4">
              <h1 
                className="relative group cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Image 
                  src="/logozoom.png"
                  alt="PlanCer Logo"
                  width={150}
                  height={50}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </h1>
              {userRole && (
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-100/70 backdrop-blur-sm text-emerald-700 
                    text-xs md:text-sm hidden sm:inline-flex rounded-full px-4 py-1
                    border border-emerald-200/50"
                >
                  {userRole === "planner" ? "Event Planner" : "Attendee"} Dashboard
                </Badge>
              )}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <>
                  <Button
                    onClick={handleRoleSwitch}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-white/50 backdrop-blur-sm border-white/50 
                      hover:bg-white/80 transition-all duration-300"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Switch to {userRole === "planner" ? "Attendee" : "Planner"}
                  </Button>

                  {userRole === "planner" && (
                    <Button
                      onClick={() => router.push("/planner/analytics")}
                      variant={pathname === "/planner/analytics" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-emerald-500/80"
                    >
                      📊 Analytics
                    </Button>
                  )}

                  <Button
                    onClick={() => router.push("/profile")}
                    variant={pathname === "/profile" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full p-2 bg-white/50 backdrop-blur-sm 
                      hover:bg-white/80 transition-all duration-300"
                    aria-label="Profile"
                  >
                    <User className="w-5 h-5" />
                  </Button>

                  {userRole === "planner" && (
                    <Button
                      onClick={() => router.push("/planner/scanner")}
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white/50 backdrop-blur-sm border-white/50 
                        hover:bg-white/80 transition-all duration-300"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Scanner
                    </Button>
                  )}

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600 rounded-full 
                      hover:bg-red-50/50 transition-all duration-300"
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
                  className="p-2 rounded-full hover:bg-white/80 transition-all duration-300"
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

          {/* Mobile Menu - Floating Panel */}
          {isMobileMenuOpen && user && (
            <div className="md:hidden mt-4 p-4 backdrop-blur-xl bg-white/70 
              rounded-[2rem] border border-white/20 shadow-lg">
              <div className="flex flex-col gap-3">
                {/* ... existing mobile menu buttons with updated classes ... */}
                {/* Apply the same rounded-full and backdrop-blur classes to all buttons */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 