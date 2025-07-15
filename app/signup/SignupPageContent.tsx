"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SignupPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState(params?.get("role") === "planner" ? "planner" : "attend");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profileCreated, setProfileCreated] = useState(false);
  const { toast } = useToast();

  const toggleRole = () => {
    const newRole = role === "planner" ? "attend" : "planner";
    setRole(newRole);
    // Update URL without page reload
    const newUrl = `/signup?role=${newRole}`;
    window.history.pushState({}, '', newUrl);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSession(data.session);
    };

    getSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, data) => {
      if (data) setSession(data);
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const saveProfile = async () => {
      if (session && !profileCreated) {
        const { user } = session;

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          // Get user name from Google OAuth user metadata if available
          let userName = fullName;
          if (user.user_metadata?.full_name) {
            userName = user.user_metadata.full_name;
          } else if (user.user_metadata?.name) {
            userName = user.user_metadata.name;
          } else if (user.user_metadata?.email) {
            // Use email as fallback if no name is available
            userName = user.user_metadata.email.split('@')[0];
          }

          const { error } = await supabase.from("profiles").insert({
            id: user.id,
            full_name: userName,
            email: user.email,
            role: role,
          });

          if (!error) {
            setProfileCreated(true);
            toast({
              title: "Success!",
              description: "Signup successful! Redirecting...",
              variant: "success",
            });
            setTimeout(() => {
              router.push(role === "planner" ? "/planner" : "/attend");
            }, 1500);
          } else {
            toast({
              title: "Error",
              description: "Failed to save user profile.",
              variant: "destructive",
            });
          }
        } else {
          router.push(role === "planner" ? "/planner" : "/attend");
        }
      }
    };

    saveProfile();
  }, [session, role, fullName, profileCreated, router]);

  const handleSignup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Check your email to complete signup.",
        variant: "success",
      });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://plancer.vercel.app/signup?role=${role}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Error",
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
        {/* Role Switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-center mb-2">
              Sign up as {role === "planner" ? "Event Planner" : "Attendee"}
            </h2>
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                role === "planner" 
                  ? "bg-emerald-100 text-emerald-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {role === "planner" ? "🎯 Event Planner" : "👥 Attendee"}
              </span>
            </div>
          </div>
          <button
            onClick={toggleRole}
            className="ml-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-gray-600">Switch to</span>
            <span className="font-medium text-emerald-600">
              {role === "planner" ? "Attendee" : "Planner"}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>
        
        <p className="text-center text-gray-500 text-sm mb-6">
          Create your account to get started
        </p>
        
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up with Email"}
          </button>

          <div className="relative text-center my-4 text-gray-400">
            <span className="bg-white px-2 z-10 relative">or</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>


        </div>
      </div>
    </div>
  );
} 