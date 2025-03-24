// app/law-advisor/page.tsx
"use client";
import { useState } from "react";
import type { Metadata } from "next";
import LawChatWindow from "@/components/lawAdvisorUtil/LawChatWindow";
import PromptIdForm from "@/components/lawAdvisorUtil/PromptIdForm"; // Import the form
export const metadata: Metadata = {
  title: "Law Advisor",
  description: "AI Law Advisor which gives personalized advice based on local laws.",
};
export default function LawAdvisorPage() {
  const [promptId, setPromptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadPromptId = async (promptIdInput: string) => {
    if (!promptIdInput.trim()) {
      setError("Please enter a Prompt ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: promptIdInput }),
      });

      if (response.ok) {
        setPromptId(promptIdInput);
      } else {
        const errorData = await response.json();
        if (errorData.error === "Invalid Prompt ID") {
          const shouldCreate = confirm(
            "Prompt ID not found. Create a new one?"
          );
          if (shouldCreate) {
            handleCreateNewPrompt();
          } else {
            setPromptId(null);
          }
        } else {
          setError(errorData.error || "Failed to load Prompt ID");
          setPromptId(null);
        }
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPrompt = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrompt: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setPromptId(data.promptId); // Set the new promptId
        if (typeof window !== "undefined") {
          localStorage.setItem("promptId", data.promptId); // No need to check, already have
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create prompt");
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      {!promptId ? (
        <PromptIdForm
          onLoad={handleLoadPromptId}
          onCreate={handleCreateNewPrompt}
          loading={loading}
          error={error}
        />
      ) : (
        <LawChatWindow promptId={promptId} />
      )}
    </main>
  );
}
