// app/(components)/PromptForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptFormProps {
  onPromptSubmit: (promptText: string) => void;
  loading: boolean;
}

export function PromptForm({ onPromptSubmit, loading }: PromptFormProps) {
  const [promptText, setPromptText] = useState("");

  const handleClick = () => {
    if (!promptText.trim()) {
      return;
    }
    onPromptSubmit(promptText);
    setPromptText(""); 
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Legal Question</Label>
        <Textarea
          id="question"
          placeholder="Enter your legal question here..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="min-h-[100px]"
          disabled={loading}
        />
      </div>
      <Button
      className="items-end"
        onClick={handleClick}
        disabled={loading || !promptText.trim()}
      >
        {loading ? "Submitting..." : "Get Legal Guidance"}
      </Button>
    </div>
  );
}