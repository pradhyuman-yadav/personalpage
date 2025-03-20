// lib/jigsawstack.ts
import { JigsawStack } from "jigsawstack";

const apiKey = process.env.JIGSAWSTACK_API_KEY;

if (!apiKey) {
  throw new Error("JIGSAWSTACK_API_KEY is not defined");
}

const jigsawstack = JigsawStack({ apiKey });

export type PromptGuardOption =
  | "defamation"
  | "specialized_advice"
  | "privacy"
  | "intellectual_property"
  | "indiscriminate_weapons"
  | "hate"
  | "sexual_content"
  | "elections"
  | "code_interpreter_abuse";

export type StructuredReturnPrompt =
  | Record<string, string>
  | Record<string, string>[];

interface CreatePromptParams {
  prompt: string;
  inputs?: { key: string; optional: boolean; initial_value?: string }[];
  return_prompt?: string | StructuredReturnPrompt;
  prompt_guard?: PromptGuardOption[];
}

interface RunPromptParams {
  id: string;
  input_values?: Record<string, string>;
}

export async function createPrompt(params: CreatePromptParams) {
  try {
    const result = await jigsawstack.prompt_engine.create(params);
    return result;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
}

export async function runPrompt(params: RunPromptParams) {
  try {
    const result = await jigsawstack.prompt_engine.run(params);
    return result;
  } catch (error) {
    console.error("Error running prompt:", error);
    throw error;
  }
}
