// app/(components)/ResultDisplay.tsx (Corrected)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultDisplayProps {
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export function ResultDisplay({ history }: ResultDisplayProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Conversation History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((turn, index) => (
          <div key={index} className={turn.role === "user" ? "text-blue-600" : "text-green-600"}>
            <p><strong>{turn.role === "user" ? "You" : "AI Assistant"}:</strong> {turn.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}