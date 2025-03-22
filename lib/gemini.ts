// lib/gemini.ts
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, Part, Content } from "@google/generative-ai";
import { Message } from "./types";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { agents } from "./agents";
import { SupabaseClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_NAME = "gemini-1.5-pro-002";  // Use 1.5 Pro for better context handling
const EMBEDDING_MODEL_NAME = "embedding-001";

// --- Safety Settings (Keep these, but adjust if needed) ---
function getSafetySettings() {
    return [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
}

// --- Generation Configuration (EXPLAINED) ---
function getGenerationConfig() {
    return {
        temperature: 0.9,  //  Creativity vs. Consistency.  0.9 is more creative, 0.2 is more deterministic.
        topK: 40,       //  Consider the top K likely tokens.  Lower values focus on the *most* likely, higher values allow more diversity.
        topP: 0.95,      //  Nucleus sampling:  Consider tokens whose cumulative probability exceeds P.  0.95 is a good default.
        maxOutputTokens: 4096, //  Maximum number of tokens in the response.  Make sure this is large enough for your needs. Gemini 1.5 pro support large.
    };
}

const supabase = createSupabaseAdmin(); // Use existing admin client

// --- PDF Handling and RAG ---

async function getEmbeddings(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values!;
    } catch (error) {
        console.error("Error in getEmbeddings:", error);
        throw error;
    }
}

// --- Main Function to Call Gemini (with RAG) ---
export async function callGemini(agentName: string, chatHistory: Message[]): Promise<{ text: string; formattedData?: any }> {
    console.log("--- callGemini invoked ---");
    console.log("Agent Name:", agentName);
    console.log("Chat History:", chatHistory);

    try {
        const agent = agents[agentName];
        if (!agent) {
            throw new Error(`Unknown agent: ${agentName}`);
        }
        console.log("Agent:", agent);

        const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings: getSafetySettings(), generationConfig: getGenerationConfig() });
        console.log("Model initialized.");

        const geminiChat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{text: agent.systemPrompt}],
                },
                ...buildGeminiHistory(chatHistory, agentName),
            ],
        });
        console.log("Gemini chat started.");

        const lastTurn = buildLastTurn(chatHistory);
        if (!lastTurn) {
            console.log("Last turn is empty.");
            return { text: "", formattedData: {} }
        }

        console.log("Last turn:", lastTurn);

        // --- RAG Integration with Agent Specialization ---
        const queryEmbedding = await getEmbeddings(lastTurn);
        console.log("Query embedding obtained.");

        // Construct the agent's folder path (e.g., "cardiologist/")
        const agentFolderPath = agentName + "/";
        console.log("agentFolderPath", agentFolderPath);


        const { data: relevantChunks, error: retrievalError } = await supabase
            .rpc('match_documents', {
                query_embedding: queryEmbedding,
                match_threshold: 0.78, // Adjust as needed
                match_count: 5, // Adjust as needed
            });
        console.log("Relevant chunks retrieved:", relevantChunks); // Don't log retrievalError here

        if (retrievalError) {
            console.error("Error retrieving relevant chunks:", retrievalError);
            // Handle the error (e.g., fall back to Gemini's pre-trained knowledge or inform user)
            // You *could* choose to continue without RAG in this case.
        }
        //Filter by agent folder path
        const filteredChunks = relevantChunks ? relevantChunks.filter((chunk: { pdf_path: string; }) => {
                console.log(`PDF Path: ${chunk.pdf_path}, Agent Folder Path: ${agentFolderPath}`); //Log paths
                return chunk.pdf_path.startsWith(agentFolderPath);
            }
        ): [];

        let context = "";
        if (filteredChunks && filteredChunks.length > 0) {
            context = "Relevant medical information:\n\n";
            for (const chunk of filteredChunks) {
                context += chunk.content + "\n\n";  // Use the `content` field
            }
        } else {
            context = "No relevant information found in your specialized knowledge base."; // Important: Inform the agent!
        }

        // --- End RAG Integration ---

        const prompt = `${context}\n\n${lastTurn}`;
        console.log("Prompt:", prompt); // Log full prompt

        const result = await geminiChat.sendMessage(prompt);
        console.log("Gemini result:", result); // Log the raw result
        const response = result.response;
        const text = response.text();
        console.log("Gemini response text:", text);

        let formattedData;
        if (agentName === "interpreter") {
            try {
                formattedData = JSON.parse(text);
                console.log("Formatted data:", formattedData);
            } catch (parseError) {
                console.warn("Interpreter did not return valid JSON:", text, parseError);
                // Could send a message back to the chat saying the interpreter failed.
            }
        }
          return { text, formattedData };

    } catch (error) {
        console.error("--- ERROR IN callGemini ---", error);
        return { text: "An error occurred while communicating with Gemini.", formattedData: undefined }; // Consistent return
    }
}

function buildGeminiHistory(chatHistory: Message[], agentName: string): Content[] {
    const relevantHistory: Content[] = [];

    for (const message of chatHistory) {
        if (message.sender_type === "user") {
            relevantHistory.push({ role: "user", parts: [{text: message.message_text}] });
        } else if (message.sender_type === agentName) {
            relevantHistory.push({ role: "model", parts: [{text: message.message_text}] });
        } else if (agents[message.sender_type]) {
            relevantHistory.push({ role: "user", parts: [{text: `${message.sender_name}: ${message.message_text}`}] });
        }
    }
    return relevantHistory;
}

function buildLastTurn(chatHistory: Message[]): string {
    let lastTurn = "";
    const lastUserMessage = chatHistory.filter(message => message.sender_type === "user").at(-1);
    const lastAgentMessage = chatHistory.filter(message => message.sender_type !== "user").at(-1);
     if (lastAgentMessage && chatHistory.indexOf(lastAgentMessage) > chatHistory.indexOf(lastUserMessage!)) {
        lastTurn = "";
    }
    else if(lastUserMessage){
         lastTurn = lastUserMessage.message_text
    }
    return lastTurn;
}

export {  getEmbeddings };