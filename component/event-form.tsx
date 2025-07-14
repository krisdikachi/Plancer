// components/EventForm.tsx
"use client"
import { useState } from "react"
import { uploadImage } from "@/lib/uploadImage"
import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"

export default function EventForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventId = uuidv4()
      let imageUrl = ""

      if (image) {
        imageUrl = await uploadImage(image, eventId)
      }

      const { error } = await supabase.from("events").insert([
        {
          id: eventId,
          planner_id: userId,
          title,
          description,
          date,
          time,
          location,
          image_url: imageUrl,
        },
      ])

      if (error) throw error
      alert("Event created successfully!")
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded-xl shadow">
      <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="w-full" required />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  )
}
