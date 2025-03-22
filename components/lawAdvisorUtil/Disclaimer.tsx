// app/(components)/Disclaimer.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export function Disclaimer() {
  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Disclaimer</AlertTitle>
      <AlertDescription>
        This AI Law Advisor provides general information only and is NOT a
        substitute for professional legal advice. Consult with a qualified
        lawyer for any legal matters.
      </AlertDescription>
    </Alert>
  );
}