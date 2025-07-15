import { Suspense } from "react";
import SignupPageContent from "./SignupPageContent";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  );
}
