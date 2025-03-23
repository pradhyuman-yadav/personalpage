// components/PromptIdForm.tsx
"use client";
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PromptIdFormProps {
    onLoad: (promptId: string) => void;
    onCreate: () => void;
    loading: boolean; // Add loading prop
    error: string | null;
}
const PromptIdForm: React.FC<PromptIdFormProps> = ({ onLoad, onCreate, loading, error }) => {
    const [promptIdInput, setPromptIdInput] = useState("");

     const handleLoadPromptId = async () => {
        if (!promptIdInput.trim()) {
           return;
        }
        onLoad(promptIdInput);
    };

    return (
        <div className="mb-4">
             <div className="text-center text-xl">
                Please enter the PromptId or create a new one.
            </div>
            <div className="flex items-center space-x-2 mt-4">
                <Input
                    type="text"
                    placeholder="Enter Prompt ID"
                    value={promptIdInput}
                    onChange={(e) => setPromptIdInput(e.target.value)}
                    disabled={loading}
                />
                <Button onClick={handleLoadPromptId} disabled={loading} variant="default">
                    Load
                </Button>
            </div>
            <div className="mt-2">
                <Button onClick={onCreate} disabled={loading} variant="outline">
                    {loading ? "Creating..." : "Create New Prompt"}
                </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default PromptIdForm;