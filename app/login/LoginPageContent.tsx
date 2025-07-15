"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState(params?.get("role") === "planner" ? "planner" : "attend");

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        // Redirect to appropriate dashboard based on user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        
        if (profile?.role === "planner") {
          router.push("/planner");
        } else {
          router.push("/attend");
        }
      }
    };

    getSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, data) => {
      if (data) setSession(data);
    });

    return () => sub?.subscription?.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        toast({
          title: "Welcome Back!",
          description: "Login successful",
          variant: "success",
        });

        // Redirect based on role
        if (profile?.role === "planner") {
          router.push("/planner");
        } else {
          router.push("/attend");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Login Failed",
          description: 'Failed to sign in with Google. Please try again.',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Google OAuth exception:', err);
      toast({
        title: "Error",
        description: 'An error occurred during Google sign-in.',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to your Plancer account
          </p>
          <div className="flex justify-center mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              role === "planner" 
                ? "bg-emerald-100 text-emerald-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {role === "planner" ? "🎯 Event Planner" : "👥 Attendee"}
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link 
              href="/forgot-password" 
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="relative text-center my-4 text-gray-400">
            <span className="bg-white px-2 z-10 relative">or</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300"></div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 