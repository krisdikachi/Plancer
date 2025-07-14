"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Save, X, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
      } else {
        setEmail(user.email || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    // Update profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", user.id);
    if (!error) {
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved.",
        variant: "success",
      });
      setEditing(false);
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      toast({
        title: "Password Changed!",
        description: "Your password has been updated.",
        variant: "success",
      });
      setShowPasswordForm(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>View and edit your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
              </div>
            ) : (
              <>
                {!editing ? (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Full Name</div>
                      <div className="text-lg font-medium text-gray-900">{fullName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="text-lg font-medium text-gray-900">{email}</div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button
                        type="button"
                        onClick={() => setEditing(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowPasswordForm((v) => !v)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" /> Change Password
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                )}
                {/* Change Password Form */}
                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="space-y-4 mt-8 border-t pt-6">
                    <div className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Key className="w-5 h-5" /> Change Password
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPassword("");
                          setConfirmPassword("");
                        }}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 