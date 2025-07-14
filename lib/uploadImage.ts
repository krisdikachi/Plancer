// lib/uploadImage.ts
import { supabase } from "@/lib/supabaseClient";

export const uploadImage = async (file: File, eventId: string) => {
  const filePath = `${eventId}/${file.name}`

  const { data, error } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

  if (error) throw error

  const { data: publicUrlData } = supabase
    .storage
    .from("event-images")
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}
