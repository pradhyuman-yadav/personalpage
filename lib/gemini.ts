// lib/gemini.ts
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Content,
} from "@google/generative-ai";
import { Message } from "./types";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { agents } from "./agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_NAME = "gemini-1.5-pro-002";
const EMBEDDING_MODEL_NAME = "embedding-001";

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  safetySettings: getSafetySettings(),
  generationConfig: getGenerationConfig(),
});

function getSafetySettings() {
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
}

function getGenerationConfig() {
  return {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
  };
}
const supabase = createSupabaseAdmin();

async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({
      model: EMBEDDING_MODEL_NAME,
    });
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;
    return embedding.values!;
  } catch (error) {
    console.error("Error in getEmbeddings:", error);
    throw error;
  }
}

async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (error: any) {
      if (error.status === 429) {
        // Check for 429 status code
        const retryAfter = parseInt(
          error.headers?.get("retry-after") ||
            String(baseDelay * 2 ** attempt + Math.random() * 1000)
        ); //Exponential backoff and random.
        console.warn(
          `Gemini API rate limit exceeded. Retrying in ${retryAfter}ms... (Attempt ${
            attempt + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
      } else {
        // Re-throw if it's not a 429 error
        console.error("Error other then rate limit:", error);
        throw error;
      }
    }
  }
  throw new Error(`Max retries (${maxRetries}) exceeded for Gemini API call.`);
}

export async function callGemini(
  agentName: string,
  chatHistory: Message[],
  lastAgentMessage: string = ""
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise<{ text: string; formattedData?: any }> {
  try {
    const agent = agents[agentName];
    console.log(agentName);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const geminiChat = model.startChat({
      history: [
        { role: "user", parts: [{ text: agent.systemPrompt }] },
        ...buildGeminiHistory(chatHistory, agentName),
      ],
    });

    const lastTurn = buildLastTurn(chatHistory); // Get the correct last turn

    let context = "";
    if (agentName !== "interpreter") {
      const queryEmbedding = await getEmbeddings(lastTurn); // Use the corrected lastTurn
      const agentFolderPath = agentName + "/";

      const { data: relevantChunks, error: retrievalError } =
        await supabase.rpc("match_documents", {
          query_embedding: queryEmbedding,
          match_threshold: 0.78,
          match_count: 5,
        });

      if (retrievalError) {
        console.error("Error retrieving relevant chunks:", retrievalError);
      }

      const filteredChunks = relevantChunks
        ? relevantChunks.filter((chunk: { pdf_path: string }) =>
            chunk.pdf_path.startsWith(agentFolderPath)
          )
        : [];

      if (filteredChunks && filteredChunks.length > 0) {
        context = "Relevant medical information:\n\n";
        for (const chunk of filteredChunks) {
          context += chunk.content + "\n\n";
        }
      } else {
        context =
          "No relevant information found in your specialized knowledge base.";
      }
    }

    let prompt = "";
    if (agentName === "interpreter") {
      prompt = `${agent.systemPrompt}\nInput: ${lastAgentMessage}\nOutput:`; // Use lastAgentMessage
    } else {
      prompt = `${context}\n\n${lastTurn}`; // Use the corrected lastTurn and context
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // const result = await geminiChat.sendMessage(prompt);
    const result = await retryWithExponentialBackoff(() =>
      geminiChat.sendMessage(prompt)
    );
    const response = result.response;
    const text = response.text();
    console.log(text);
    return { text, formattedData: undefined };
  } catch (error) {
    console.error("--- ERROR IN callGemini ---", error);
    return {
      text: "An error occurred while communicating with Gemini.",
      formattedData: undefined,
    };
  }
}

function buildGeminiHistory(
  chatHistory: Message[],
  agentName: string
): Content[] {
  const relevantHistory: Content[] = [];

  for (const message of chatHistory) {
    if (message.sender_type === "user") {
      relevantHistory.push({
        role: "user",
        parts: [{ text: message.message_text }],
      });
    } else if (message.sender_type === agentName) {
      relevantHistory.push({
        role: "model",
        parts: [{ text: message.message_text }],
      });
    } else if (agents[message.sender_type]) {
      // Include messages from *other* agents as user messages (for context).
      relevantHistory.push({
        role: "user",
        parts: [{ text: `${message.sender_name}: ${message.message_text}` }],
      });
    }
  }
  return relevantHistory;
}

// Corrected buildLastTurn function
function buildLastTurn(chatHistory: Message[]): string {
  let lastTurn = "";
  const lastUserMessage = chatHistory
    .filter((message) => message.sender_type === "user")
    .pop();
  const lastAgentMessage = chatHistory
    .filter(
      (message) =>
        message.sender_type !== "user" && message.sender_type !== "system"
    )
    .pop();

  // Build the last turn, including *both* the last user and last agent message (if they exist)
  if (lastAgentMessage) {
    lastTurn += `${lastAgentMessage.sender_name}: ${lastAgentMessage.message_text}\n`;
  }
  if (lastUserMessage) {
    lastTurn += `You: ${lastUserMessage.message_text}`;
  }
  return lastTurn;
}

export { getEmbeddings };
