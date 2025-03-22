"use client";
import { useState, useEffect, useRef } from "react";
import { Disclaimer } from "@/components/lawAdvisorUtil/Disclaimer";
import { PromptForm } from "@/components/lawAdvisorUtil/PromptForm";
import { ResultDisplay } from "@/components/lawAdvisorUtil/ResultDisplay";
import { LoadingSpinner } from "@/components/lawAdvisorUtil/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [promptId, setPromptId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const historyRef = useRef<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [promptIdInput, setPromptIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newPromptLoading, setNewPromptLoading] = useState(false);
  // const [isNewPrompt, setIsNewPrompt] = useState(false);

  // Load promptId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPromptId = localStorage.getItem("promptId");
      if (storedPromptId && isValidUUID(storedPromptId)) {
        setPromptId(storedPromptId);
        setPromptIdInput(storedPromptId);
      }
    }
  }, []);

    useEffect(() => {
        const fetchHistory = async () => {
        if (promptId) { // Remove !isNewPrompt
            setLoading(true);
            setError(null);
            try {
            const response = await fetch("/api/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promptId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.history) {
                const parsed = parseHistory(data.history);
                setConversationHistory(parsed);
                historyRef.current = parsed;
                } else {
                setConversationHistory([]);
                historyRef.current = [];
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to fetch history");
                setPromptId(null); // Clear invalid promptId
                if (typeof window !== "undefined") {
                localStorage.removeItem("promptId"); // Remove from localStorage
                }
            }
            } catch (error) {
            setError("An unexpected error occurred.");
            } finally {
            setLoading(false);
            }
        }
        };
        fetchHistory();
    }, [promptId]); // Only depend on PromptId


  // Save promptId to localStorage
  useEffect(() => {
    if (promptId && typeof window !== "undefined") {
      localStorage.setItem("promptId", promptId);
    }
  }, [promptId]);

    //useEffect for promptIdInput
    useEffect(()=>{
        if(promptId){
            setPromptIdInput(promptId)
        }
    }, [promptId])

  const handlePromptSubmit = async (promptText: string) => {
    if (!promptText.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);

        const historyString = historyRef.current
        .map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
        .join("\n");

        const inputValues: Record<string, any> = {
            question: promptText,
            history: historyString,
        };


    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                promptId,
                inputValues, // Send complete inputValues
            }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use functional update for setConversationHistory
        setConversationHistory((prevHistory) => {
          const newHistory: Array<{
            role: "user" | "assistant";
            content: string;
          }> = [
            ...prevHistory,
            { role: "user", content: promptText },
            { role: "assistant", content: data.result },
          ];
          historyRef.current = newHistory; // Update ref immediately
          return newHistory; // Return the *new* array
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to get response");
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPromptId = async () => {
    if (!promptIdInput.trim()) {
      setError("Please enter a Prompt ID.");
      return;
    }
    if (!isValidUUID(promptIdInput)) {
      setError("Invalid Prompt ID format.");
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
        const data = await response.json();
        setPromptId(promptIdInput);
        if (data.history) {
          const parsed = parseHistory(data.history);
          setConversationHistory(parsed);
          historyRef.current = parsed;
        } else {
          setConversationHistory([]);
          historyRef.current = [];
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("promptId", promptIdInput);
        }
      } else {
        const errorData = await response.json();
        if (errorData.error === "Invalid Prompt ID") {
          const shouldCreate = confirm(
            "Prompt ID not found. Create a new one?"
          );
          if (shouldCreate) {
            handleCreateNewPrompt();
          } else {
            setPromptIdInput("");
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
    setNewPromptLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrompt: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setPromptId(data.promptId);
        setPromptIdInput(data.promptId);
        setConversationHistory([]);
        historyRef.current = [];

        if (typeof window !== "undefined") {
          localStorage.setItem("promptId", data.promptId);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create prompt");
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${(error as Error).message}`);
    } finally {
      setNewPromptLoading(false);
    }
  };
  const parseHistory = (historyArray: string[]) => {
    const parsedHistory: { role: "user" | "assistant"; content: string }[] = [];
    for (let i = 0; i < historyArray.length; i += 2) {
      const userTurn = historyArray[i];
      const assistantTurn = historyArray[i + 1];

      if (userTurn && assistantTurn) {
        parsedHistory.push({
          role: userTurn.startsWith("User:") ? "user" : "assistant",
          content: userTurn.replace(/^User: |^Assistant: /, ""),
        } as { role: "user" | "assistant"; content: string });
        parsedHistory.push({
          role: assistantTurn.startsWith("User:") ? "user" : "assistant",
          content: assistantTurn.replace(/^User: |^Assistant: /, ""),
        } as { role: "user" | "assistant"; content: string });
      }
    }
    return parsedHistory;
  };

  const isValidUUID = (uuid: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Disclaimer />
      <header className="py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold ">AI Law Advisor</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        <div className="max-w-3xl mx-auto">
          {!promptId && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter or Paste Prompt ID"
                  value={promptIdInput}
                  onChange={(e) => setPromptIdInput(e.target.value)}
                />
                <Button onClick={handleLoadPromptId} disabled={loading}>
                  Load
                </Button>
              </div>
              <div className="mt-2">
                <Button
                  onClick={handleCreateNewPrompt}
                  disabled={newPromptLoading}
                >
                  {newPromptLoading ? (
                    <>
                      <LoadingSpinner />
                      Creating...
                    </>
                  ) : (
                    "Create New Prompt"
                  )}
                </Button>
              </div>
            </div>
          )}

          {promptId && (
            <>
              <PromptForm
                onPromptSubmit={handlePromptSubmit}
                loading={loading}
              />
              {loading && (
                <div className="flex justify-center my-4">
                  <LoadingSpinner />
                </div>
              )}
              {error && <div className="text-red-500 my-4">{error}</div>}
              <ResultDisplay history={conversationHistory.slice().reverse()} />
            </>
          )}
        </div>
      </main>

      <footer className="py-4 mt-8 text-center text-gray-600">
        &copy; {new Date().getFullYear()} AI Law Advisor. All rights reserved.
      </footer>
    </div>
  );
}