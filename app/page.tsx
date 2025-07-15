"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Users,
  QrCode,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Landing page for Plancer
// Allows users to choose between being an event planner or attendee
// Redirects to signup page with appropriate role query parameter
// Uses Next.js routing and state management
const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    };
    checkAuth();
  }, []);

  const handleNavigate = async (role: "planner" | "attend") => {
    setLoading(true);
    if (user && userRole) {
      // If user is authenticated and role matches, go to dashboard
      if (userRole === role) {
        router.push(role === "planner" ? "/planner" : "/attend");
        return;
      }
      // If user is authenticated but role does not match, switch role and go to dashboard
      await supabase.from("profiles").update({ role }).eq("id", user.id);
      router.push(role === "planner" ? "/planner" : "/attend");
      return;
    }
    // If not authenticated, go to login page with role param
    router.push(`/login?role=${role}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Plan<span className="text-emerald-600">cer</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The smart way to plan, manage, and attend events
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Smart Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Easy Management</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>Digital Invites</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Event Planner Card */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-200"
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                I'm an Event Planner
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create, manage, and track your events with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>AI-powered event creation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Beautiful invitation cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Real-time analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>QR code generation</span>
                </li>
              </ul>
              <Button
                onClick={() => handleNavigate("planner")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                Start Planning Events
              </Button>
            </CardContent>
          </Card>

          {/* Attendee Card */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                I'm an Attendee
              </CardTitle>
              <CardDescription className="text-gray-600">
                Discover and join amazing events in your area
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Personalized event recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Easy RSVP management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Event reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Digital tickets</span>
                </li>
              </ul>
              <Button
                onClick={() => handleNavigate("attend")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                Find Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
