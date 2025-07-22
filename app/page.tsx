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
  ArrowRight,
  Star,
  Zap,
  Shield,
  Smartphone,
  BarChart3,
  Clock,
  MapPin,
  Mail,
  Bell,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
  Crown,
  Infinity,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Landing page for Plancer
// Allows users to choose between being an event planner or attendee
// Redirects to signup page with appropriate role query parameter
// Uses Next.js routing and state management
const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    
    try {
      // Send email to your address
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: waitlistEmail, // Only send the email field
        }),
      });

      if (response.ok) {
        setWaitlistSuccess(true);
        setWaitlistEmail("");
        setTimeout(() => {
          setWaitlistModalOpen(false);
          setWaitlistSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending waitlist email:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const openWaitlistModal = () => {
    setWaitlistModalOpen(true);
    setWaitlistSuccess(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Revolutionary Event Planning Platform</span>
            </div>
            
            {/* Limited Time Offer Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-bold text-lg">🎉 FREE FOR LIMITED TIME!</p>
                  <p className="text-sm opacity-90">Get full access until <span className="font-bold">August 18, 2025</span> - No credit card required</p>
                </div>
              </div>
            </div>
            
            <h1 className="text-7xl font-bold text-gray-900 mb-6">
              Plan<span className="text-emerald-600">cer</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The smart way to plan, manage, and attend events. From intimate gatherings to large-scale conferences, 
              Plancer makes event management effortless and engaging.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap mb-8">
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
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Real-time Analytics</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">4.9/5 from 2,500+ users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free today and choose the billing model that works best for you
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan Card */}
            <Card className="border-2 border-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                FREE UNTIL AUG 18
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Free Plan</CardTitle>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-emerald-600">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <CardDescription className="text-gray-600">
                  Perfect for getting started with event planning
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Up to 5 events per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Basic event creation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>QR code generation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Up to 1000 attendees per event</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Email support</span>
                  </li>
                 
                </ul>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                  <p className="text-orange-800 text-sm font-medium">
                    ⏰ Limited Time: Free until August 18, 2025
                  </p>
                </div>
                <Button
                  onClick={() => handleNavigate("planner")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  Start Free Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan Card */}
            <Card className="border-2 border-purple-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                COMING SOON
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Pro Plan</CardTitle>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-purple-600">$5</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <CardDescription className="text-gray-600">
                  For serious event planners and businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span><strong>Unlimited events</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Advanced AI with custom templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Custom branding & white-label options</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Unlimited attendees per event</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Priority support & dedicated account manager</span>
                  </li>
                  
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Advanced security & compliance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Team collaboration tools</span>
                  </li>
                 
                </ul>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                  <p className="text-purple-800 text-sm font-medium">
                    🚀 Launching after August 18, 2025
                  </p>
                </div>
                <Button
                  onClick={openWaitlistModal}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  Join the Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Billing Options */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Flexible Billing Options</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Monthly Subscription
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span>Pay $5/month for unlimited access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span>Cancel anytime, no long-term commitment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span>All events remain active while subscribed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span>Perfect for regular event planners</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    Per-Event Billing
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      <span>Pay $2 per event (coming soon)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      <span>Events remain accessible forever</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      <span>No subscription required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      <span>Perfect for occasional event planners</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Event Access Policy */}
              <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Event Access Policy</h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Monthly Subscription:</h5>
                    <ul className="space-y-1">
                      <li>• All events remain active while subscribed</li>
                      <li>• If subscription expires, events are paused</li>
                      <li>• Reactivate subscription to restore access</li>
                      <li>• Event data is preserved for 12 months</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Per-Event Billing:</h5>
                    <ul className="space-y-1">
                      <li>• Events remain accessible forever</li>
                      <li>• No subscription required</li>
                      <li>• Pay once, access anytime</li>
                      <li>• Perfect for future events</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing Note */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              <strong>Early Bird Special:</strong> Users who sign up during the free period will get 50% off the Pro plan for the first 6 months when it launches!
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Plancer Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're planning events or attending them, Plancer streamlines the entire process
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* For Event Planners */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                For Event Planners
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Create Your Event</h4>
                    <p className="text-gray-600">Use our AI-powered event creation tool to design beautiful events in minutes. Choose from templates or start from scratch.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Generate Digital Invites</h4>
                    <p className="text-gray-600">Create stunning invitation cards with QR codes. Share via email, social media, or direct links.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Track & Manage</h4>
                    <p className="text-gray-600">Monitor RSVPs, send reminders, and get real-time analytics on your event's performance.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Host with Confidence</h4>
                    <p className="text-gray-600">Use QR code check-ins, manage attendees, and ensure a smooth event experience.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Attendees */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                For Attendees
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Discover Events</h4>
                    <p className="text-gray-600">Browse through curated events in your area or receive personalized recommendations based on your interests.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Easy RSVP</h4>
                    <p className="text-gray-600">RSVP with one click and receive your digital ticket instantly. No more paper tickets to lose!</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Stay Updated</h4>
                    <p className="text-gray-600">Get timely reminders, updates, and notifications about your upcoming events.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attend & Connect</h4>
                    <p className="text-gray-600">Check in seamlessly with QR codes and connect with other attendees through our platform.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Plancer?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make event planning and attendance effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">AI-Powered Creation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Create professional events in minutes with our intelligent AI assistant that suggests themes, layouts, and content.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Mobile-First Design</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Perfect experience on any device. Create, manage, and attend events seamlessly from your phone or computer.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Track attendance, engagement, and event performance with detailed analytics and insights.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">QR Code Check-ins</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Streamlined check-in process with QR codes. No more long lines or manual registration.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Smart Notifications</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Automated reminders, updates, and notifications keep everyone informed and engaged.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Enterprise-grade security ensures your event data is safe and your platform is always available.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Events?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event planners and attendees who trust Plancer for their events
          </p>
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>10,000+ Events Created</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>50,000+ Happy Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started Today</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your role and start your journey with Plancer
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Event Planner Card */}
            <Card
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-emerald-200 hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-emerald-600" />
                </div>
                <CardTitle className="text-3xl text-gray-900">
                  I'm an Event Planner
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Create, manage, and track your events with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>AI-powered event creation with smart suggestions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Beautiful, customizable invitation cards</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Real-time analytics and attendance tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>QR code generation and check-in management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Automated reminders and notifications</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleNavigate("planner")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                  disabled={loading}
                >
                  Start Planning Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Attendee Card */}
            <Card
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-3xl text-gray-900">
                  I'm an Attendee
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Discover and join amazing events in your area
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Personalized event recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>One-click RSVP and digital tickets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Smart event reminders and updates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Easy check-in with QR codes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Connect with other attendees</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleNavigate("attend")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  disabled={loading}
                >
                  Find Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
          <p className="text-gray-300 mb-6">
            Our team is here to help you get started with Plancer
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>androtechlistgroup@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <Dialog open={waitlistModalOpen} onOpenChange={setWaitlistModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {waitlistSuccess ? "🎉 You're on the List!" : "Join the Pro Plan Waitlist"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {waitlistSuccess 
                ? "We'll notify you as soon as the Pro plan launches with exclusive early access!"
                : "Be the first to know when our Pro plan launches and get exclusive early access with 50% off for the first 6 months."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!waitlistSuccess ? (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-purple-800 text-sm">
                  <strong>Early Bird Perks:</strong>
                </p>
                <ul className="text-purple-700 text-sm mt-1 space-y-1">
                  <li>• 50% off for first 6 months</li>
                  <li>• Priority access to new features</li>
                  <li>• Exclusive beta testing opportunities</li>
                  <li>• Dedicated onboarding support</li>
                </ul>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={waitlistLoading}
              >
                {waitlistLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining Waitlist...
                  </div>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">
                Successfully joined the waitlist!
              </p>
              <p className="text-sm text-gray-600">
                We'll send you an email confirmation shortly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
