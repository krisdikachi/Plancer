"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, event_id, user_id, has_checked_in, created_at")
        .order("created_at", { ascending: false });
      if (!error) setRecords(data);
    };
    fetchRecords();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Check-in History</h1>
      <div className="space-y-4">
        {records.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.event_id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User: {r.user_id}</p>
              <p>Checked in: {r.has_checked_in ? "Yes" : "No"}</p>
              <p>At: {new Date(r.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
