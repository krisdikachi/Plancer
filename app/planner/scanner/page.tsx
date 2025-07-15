import { Suspense } from "react";
import ScannerPageContent from "./ScannerPageContent";

export default function ScannerPage() {
  return (
    <Suspense>
      <ScannerPageContent />
    </Suspense>
  );
}
