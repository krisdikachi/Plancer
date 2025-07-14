"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Copy, CheckCircle, Search, X, Trash2 } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "checkedin">("all");
  const [manualCheckInCode, setManualCheckInCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendees = async () => {
      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          id, 
          barcode_code, 
          has_checked_in, 
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("event_id", eventId);

      if (!error) {
        // Fix profiles structure - Supabase returns it as an array
        const fixedAttendees = data.map((attendee: any) => ({
          ...attendee,
          full_name: attendee.profiles && Array.isArray(attendee.profiles) && attendee.profiles.length > 0 
            ? attendee.profiles[0].full_name 
            : 'Unknown',
          email: attendee.profiles && Array.isArray(attendee.profiles) && attendee.profiles.length > 0 
            ? attendee.profiles[0].email 
            : 'No email'
        }));
        setAttendees(fixedAttendees);
      } else {
        console.error("Error fetching attendees:", error.message);
      }

      setLoading(false);
    };

    if (eventId) fetchAttendees();
  }, [eventId]);

  const exportCSV = () => {
    const csv = Papa.unparse(
      attendees.map((a) => ({
        Name: a.full_name,
        Email: a.email,
        Code: a.barcode_code,
        Status: a.has_checked_in ? "Checked In" : "RSVP",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `attendees-${eventId}.csv`);
  };

  const markCheckedIn = async (id: string) => {
    const { data, error } = await supabase
      .from("event_attendees")
      .update({ has_checked_in: true })
      .eq("id", id)
      .select();

    if (!error) {
      setAttendees((prev) =>
        prev.map((att) =>
          att.id === id ? { ...att, has_checked_in: true } : att
        )
      );
    }
  };

  const filtered = attendees.filter((a) =>
    filter === "checkedin" ? a.has_checked_in : true
  );

  const handleSendReminders = async () => {
    try {
      const res = await fetch(`/api/send-reminders`, {
        method: "POST",
        body: JSON.stringify({ eventId }),
        headers: { "Content-Type": "application/json" },
      });
  
      const result = await res.json();
      if (result.success) {
        toast({
          title: "Success!",
          description: `Sent ${result.count} reminders`,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send reminders",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualCheckInCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a code",
        variant: "destructive",
      });
      return;
    }

    setCheckingIn(true);

    try {
      // Find attendee by barcode code
      const { data: attendee, error } = await supabase
        .from('event_attendees')
        .select(`
          id,
          has_checked_in,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('barcode_code', manualCheckInCode.trim())
        .single();

      if (error || !attendee) {
        toast({
          title: "Error",
          description: "Attendee not found with this code",
          variant: "destructive",
        });
        return;
      }

      if (attendee.has_checked_in) {
        toast({
          title: "Already Checked In",
          description: "This attendee has already been checked in",
          variant: "warning",
        });
        return;
      }

      // Update check-in status
      const { error: updateError } = await supabase
        .from('event_attendees')
        .update({ has_checked_in: true })
        .eq('id', attendee.id);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to check in attendee",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setAttendees((prev) =>
        prev.map((att) =>
          att.id === attendee.id ? { ...att, has_checked_in: true } : att
        )
      );

      const attendeeName = attendee.profiles && Array.isArray(attendee.profiles) && attendee.profiles.length > 0 
        ? attendee.profiles[0].full_name 
        : 'Attendee';
      toast({
        title: "Success!",
        description: `Successfully checked in ${attendeeName}`,
        variant: "success",
      });
      setManualCheckInCode('');
    } catch (err) {
      toast({
        title: "Error",
        description: "Error checking in attendee",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl">Attendees</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFilter("all")}>All</Button>
            <Button variant="outline" onClick={() => setFilter("checkedin")}>Checked-In</Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        
        {/* Manual Check-in Section */}
        <div className="px-6 pb-4 border-b">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manual Check-in by Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter attendee code"
                  value={manualCheckInCode}
                  onChange={(e) => setManualCheckInCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                  className="pl-10 pr-10"
                />
                {manualCheckInCode && (
                  <button
                    onClick={() => setManualCheckInCode('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleManualCheckIn}
                disabled={checkingIn || !manualCheckInCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {checkingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
            </div>

          </div>
        </div>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">No attendees found</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((a) => {
                const link = `${process.env.NEXT_PUBLIC_SITE_URL}/attend?code=${a.barcode_code}`;
                return (
                  <div key={a.id} className="flex justify-between items-start border-b py-3 text-sm">
                    <div>
                      <p className="font-medium">{a.full_name || "Unknown"}</p>
                      <p className="text-gray-500">{a.email}</p>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded">{link}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(link)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={a.has_checked_in ? "bg-green-600" : "bg-gray-300 text-black"}>
                        {a.has_checked_in ? "Checked In" : "RSVP"}
                      </Badge>
                      {!a.has_checked_in && (
                        <Button size="sm" onClick={() => markCheckedIn(a.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Check In
                        </Button>
                        

                        
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
         <ConfirmDialog
           title="Send Reminders"
           description="Send reminder emails to all attendees? This action cannot be undone."
           trigger={
             <Button className="bg-green-600 hover:bg-green-700 mb-4">
               Send Reminder to All
             </Button>
           }
           onConfirm={handleSendReminders}
           confirmText="Send Reminders"
         />

      </Card>
    </div>
  );
}
