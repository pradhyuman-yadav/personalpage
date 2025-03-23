// lib/gemini.ts
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
  Content,
} from "@google/generative-ai";
import { Message } from "./types";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { agents } from "./agents";
import { SupabaseClient } from "@supabase/supabase-js";
import * as fz from "fuzzball"; // Import fuzzball

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_NAME = "gemini-1.5-pro-002"; // Use 1.5 Pro for better context handling
const EMBEDDING_MODEL_NAME = "embedding-001";

// Initialize the generative model *outside* the function, at the top level of the module.
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  safetySettings: getSafetySettings(),
  generationConfig: getGenerationConfig(),
});

// --- Safety Settings (Keep these, but adjust if needed) ---
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

// --- Generation Configuration (EXPLAINED) ---
function getGenerationConfig() {
  return {
    temperature: 0.9, //  Creativity vs. Consistency.  0.9 is more creative, 0.2 is more deterministic.
    topK: 40, //  Consider the top K likely tokens.  Lower values focus on the *most* likely, higher values allow more diversity.
    topP: 0.95, //  Nucleus sampling:  Consider tokens whose cumulative probability exceeds P.  0.95 is a good default.
    maxOutputTokens: 4096, //  Maximum number of tokens in the response.  Make sure this is large enough for your needs. Gemini 1.5 pro support large.
  };
}
const supabase = createSupabaseAdmin();

// --- PDF Handling and RAG ---

async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({
      model: EMBEDDING_MODEL_NAME,
    }); // Use a separate model instance
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;
    return embedding.values!;
  } catch (error) {
    console.error("Error in getEmbeddings:", error);
    throw error;
  }
}

// --- Data Extraction and Validation ---

interface InterpretedData {
  // Define the *ideal* structure
  primaryComplaint: string | null;
  symptoms: Symptom[];
  otherRelevantDetails: string | null;
  suggestedSpecialist: string | null;
}

interface Symptom {
  name: string | null;
  onset: string | null;
  severity: string | null;
  location: string | null;
  duration: string | null;
  character: string | null;
  aggravatingFactors: string | null;
  alleviatingFactors: string | null;
  radiation: string | null;
  timing: string | null;
  additionalDetails: string | null;
}

// Helper function to parse and validate the Interpreter's output
// function parseInterpreterOutput(geminiText: string): InterpretedData {
//     let parsedData: any = {};
//     try {
//         parsedData = JSON.parse(geminiText);
//     } catch (error) {
//         console.warn("Interpreter did not return valid JSON:", geminiText, error);
//         return { // Return a default object if parsing fails
//             primaryComplaint: null,
//             symptoms: [],
//             otherRelevantDetails: null,
//             suggestedSpecialist: null,
//         };
//     }

//     const result: InterpretedData = {
//         primaryComplaint: null,
//         symptoms: [],
//         otherRelevantDetails: null,
//         suggestedSpecialist: null,
//     };

//     // Use fuzzy matching to map keys and extract values
//     const schema: Record<string, keyof InterpretedData> = {  // Define the expected keys
//         "primary complaint": "primaryComplaint",
//         "primarycomplaint": "primaryComplaint", // Handle variations
//         "symptoms": "symptoms",
//         "other relevant details": "otherRelevantDetails",
//         "otherrelevantdetails": "otherRelevantDetails",
//         "suggested specialist": "suggestedSpecialist",
//         "suggestedspecialist": "suggestedSpecialist",
//     };
//     // Symptoms schema
//     const symptomSchema: Record<string, keyof Symptom> = {
//         "name": "name",
//         "onset": "onset",
//         "severity": "severity",
//         "location": "location",
//         "duration": "duration",
//         "character": "character",
//         "aggravating factors": "aggravatingFactors",
//         "aggravatingfactors": "aggravatingFactors",
//         "alleviating factors": "alleviatingFactors",
//         "alleviatingfactors": "alleviatingFactors",
//         "radiation": "radiation",
//         "timing": "timing",
//         "additional details": "additionalDetails",
//         "additionaldetails": "additionalDetails",
//     }

//     for (const key in parsedData) {
//         let bestMatch = null;
//         let bestScore = 0;

//         //Fuzzy match with main keys
//         for(const schemaKey in schema){
//             const score = fz.ratio(key.toLowerCase(), schemaKey.toLowerCase());
//             if(score > bestScore){
//                 bestScore = score;
//                 bestMatch = schemaKey;
//             }
//         }

//         if (bestMatch && bestScore > 80) { //  Similarity threshold (adjust as needed)
//             const matchedKey = schema[bestMatch];

//             if(matchedKey === "symptoms"){ //If Symptoms then check each symptoms
//                 if (Array.isArray(parsedData[key])) {

//                     result.symptoms = parsedData[key].map((symptomData: any) => {
//                         const symptom: Symptom = {  // Initialize with nulls
//                             name: null,
//                             onset: null,
//                             severity: null,
//                             location: null,
//                             duration: null,
//                             character: null,
//                             aggravatingFactors: null,
//                             alleviatingFactors: null,
//                             radiation: null,
//                             timing: null,
//                             additionalDetails: null,
//                         };

//                         // Extract values for symptom

//                         for(const symptomKey in symptomData){
//                             let symptomBestMatch = null;
//                             let symptomBestScore = 0;

//                             for(const symptomSchemaKey in symptomSchema){
//                                 const score = fz.ratio(symptomKey.toLowerCase(), symptomSchemaKey.toLowerCase());
//                                 if(score > symptomBestScore){
//                                     symptomBestScore = score;
//                                     symptomBestMatch = symptomSchemaKey
//                                 }
//                             }
//                              if (symptomBestMatch && symptomBestScore > 80) {
//                                 const matchedSymptomKey = symptomSchema[symptomBestMatch];
//                                 symptom[matchedSymptomKey] = typeof symptomData[symptomKey] === 'string' ? symptomData[symptomKey] : null;
//                              }
//                         }

//                         return symptom;
//                     });
//                 }
//             } else {
//                 //Handle other keys
//                 result[matchedKey] =
//                 typeof parsedData[key] === 'string' ? parsedData[key] : null;
//             }

//         }
//     }

//     return result;
// }

// --- Main Function to Call Gemini (with RAG) ---
export async function callGemini(
  agentName: string,
  chatHistory: Message[],
  userMessage: string = ""
): Promise<{ text: string; formattedData?: any }> {
  console.log("--- callGemini invoked ---");
  console.log("Agent Name:", agentName);
  // console.log("Chat History:", chatHistory); // Keep, but maybe truncate for very long histories

  try {
    const agent = agents[agentName];
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }
    console.log("Agent:", agent);

    // const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings: getSafetySettings(), generationConfig: getGenerationConfig() }); // Moved up
    console.log("Model initialized.");

    const geminiChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: agent.systemPrompt }],
        },
        ...buildGeminiHistory(chatHistory, agentName),
      ],
    });
    console.log("Gemini chat started.");

    const lastTurn = buildLastTurn(chatHistory);
    // if (!lastTurn) { //No need to check this now. Since, if agent is interpretor we pass userMessage
    //     console.log("Last turn is empty.");
    //     return { text: "", formattedData: {} }
    // }

    console.log("Last turn:", lastTurn);

    // --- RAG Integration with Agent Specialization ---
    const queryEmbedding = await getEmbeddings(lastTurn);
    console.log("Query embedding obtained:", queryEmbedding); // LOG THE EMBEDDING

    // Construct the agent's folder path (e.g., "cardiologist/")
    const agentFolderPath = agentName + "/";
    console.log("agentFolderPath", agentFolderPath);

    const { data: relevantChunks, error: retrievalError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.78,
        match_count: 5,
      }
    );

    // Log *both* the chunks and the error
    console.log("Relevant chunks retrieved (raw):", relevantChunks);
    console.log("Retrieval error:", retrievalError); // Log any errors

    if (retrievalError) {
      console.error("Error retrieving relevant chunks:", retrievalError);
      // Handle the error
    }
    //Filter by agent folder path
    const filteredChunks = relevantChunks
      ? relevantChunks.filter((chunk: { pdf_path: string; }) => {
          console.log(
            `PDF Path: ${chunk.pdf_path}, Agent Folder Path: ${agentFolderPath}`
          ); //Log paths
          return chunk.pdf_path.startsWith(agentFolderPath);
        })
      : [];

    console.log("Filtered Chunks (after agent filter):", filteredChunks); // Log after filtering

    let context = "";
    if (filteredChunks && filteredChunks.length > 0) {
      context = "Relevant medical information:\n\n";
      for (const chunk of filteredChunks) {
        context += chunk.content + "\n\n"; // Use the `content` field
      }
    } else {
      context =
        "No relevant information found in your specialized knowledge base.";
    }
    console.log("Final Context:", context); // Log the final context *before* the prompt

    // --- End RAG Integration ---

    const prompt =
      agentName !== "interpreter" ? `${context}\n\n${lastTurn}` : userMessage;

    console.log("Prompt:", prompt); // Log full prompt

    const result = await geminiChat.sendMessage(prompt);
    console.log("Gemini result:", result); // Log the raw result
    const response = result.response;
    const text = response.text();
    console.log("Gemini response text:", text);

    // --- Parse and Validate Interpreter Output ---
    let formattedData: InterpretedData | undefined = undefined; // Use the interface
    if (agentName === "interpreter") {
      // formattedData = parseInterpreterOutput(text);  NO MORE NEEDED
      // console.log("Formatted data (Parsed):", formattedData);
      return { text, formattedData: undefined }; // Interpreter returns ONLY text now
    }

    return { text, formattedData };
  } catch (error) {
    console.error("--- ERROR IN callGemini ---", error);
    return {
      text: "An error occurred while communicating with Gemini.",
      formattedData: undefined,
    }; // Consistent return
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
      relevantHistory.push({
        role: "user",
        parts: [{ text: `${message.sender_name}: ${message.message_text}` }],
      });
    }
  }
  return relevantHistory;
}

function buildLastTurn(chatHistory: Message[]): string {
  let lastTurn = "";
  const lastUserMessage = chatHistory
    .filter((message) => message.sender_type === "user")
    .at(-1);
  const lastAgentMessage = chatHistory
    .filter(
      (message) =>
        message.sender_type !== "user" && message.sender_type !== "system"
    )
    .at(-1); //Exclude system for agent
  if (
    lastAgentMessage &&
    chatHistory.indexOf(lastAgentMessage) >
      chatHistory.indexOf(lastUserMessage!)
  ) {
    lastTurn = "";
  } else if (lastUserMessage) {
    lastTurn = lastUserMessage.message_text;
  }
  return lastTurn;
}

export { getEmbeddings };
