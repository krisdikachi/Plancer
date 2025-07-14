"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Event = {
  title: string;
  invite_code: string;
};

type EventActionsProps = {
  event: Event;
  eventUrl: string;
};

export function EventActions2({ event, eventUrl }: EventActionsProps) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `Join my event "${event.title}"! Use invite code: ${event.invite_code}\n${eventUrl}`;

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareWithQR = () => {
    setShowQR(true);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${event.title}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToFacebook = () => {
    // Enhanced Facebook sharing with better metadata
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  return (
    <>
      {/* Share Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <Button
          onClick={shareToWhatsApp}
          className="bg-green-600 hover:bg-green-700"
        >
          📱 Share to WhatsApp
        </Button>
        
        <Button
          onClick={shareWithQR}
          variant="outline"
        >
          📋 Share with QR Code
        </Button>

        <Button
          onClick={shareToFacebook}
          variant="outline"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          📘 Share on Facebook
        </Button>

        <Button
          onClick={copyLink}
          variant="outline"
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </Button>

        <a href={`mailto:?subject=Join my event&body=${encodeURIComponent(shareText)}`} className="inline-block" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">📧 Share via Email</Button>
        </a>
        
        <a href={`https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`} className="inline-block" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">📱 Share on Telegram</Button>
        </a>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">QR Code for {event.title}</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={eventUrl} size={200} />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Invite Code: <span className="font-mono font-bold">{event.invite_code}</span>
            </p>
            <div className="flex gap-2">
              <Button onClick={downloadQR} className="flex-1">
                📥 Download QR
              </Button>
              <Button 
                onClick={() => setShowQR(false)} 
                variant="outline" 
                className="flex-1"
              >
                ✕ Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventActions2;
