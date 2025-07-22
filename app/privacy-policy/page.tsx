"use client"

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: June 2024</p>
      <p className="mb-4">
        Plancer ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our event management platform.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><b>Account Information:</b> Name, email address, password, and profile details.</li>
        <li><b>Event Data:</b> Details about events you create, attend, or interact with.</li>
        <li><b>Usage Data:</b> Device, browser, and usage information collected automatically.</li>
        <li><b>Cookies:</b> We use cookies and similar technologies to enhance your experience.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To provide and improve our services</li>
        <li>To communicate with you about your account or events</li>
        <li>To personalize your experience</li>
        <li>To ensure security and prevent fraud</li>
        <li>To comply with legal obligations</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Sharing Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>With service providers who help us operate our platform</li>
        <li>With event organizers (for events you join or attend)</li>
        <li>When required by law or to protect our rights</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Third-Party Services</h2>
      <p className="mb-4">
        We may use third-party services (such as payment processors, analytics, and authentication providers). Their use of your information is governed by their own privacy policies.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Security</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Your Rights</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Access, update, or delete your personal information</li>
        <li>Opt out of marketing communications</li>
        <li>Request data portability</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Children’s Privacy</h2>
      <p className="mb-4">
        Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">8. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">9. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@plancer.vercel.app" className="text-blue-600 underline">support@plancer.vercel.app</a>.
      </p>
    </div>
  );
} 