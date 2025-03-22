// lib/gemini.ts
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
  Content,
} from "@google/generative-ai";
import { Message } from "./types";
import { createClient } from "@supabase/supabase-js";
import pdfParse from 'pdf-parse';
import * as fs from "node:fs/promises"; // Use node:fs/promises for async file operations

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_NAME = "gemini-1.5-pro-002"; // Or another suitable model
const EMBEDDING_MODEL_NAME = "embedding-001"; // Gemini embedding model

// Helper function to create the safety settings
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

// Helper function to create the generation config
function getGenerationConfig() {
  return {
    temperature: 0.7, // Adjust for creativity (higher values) vs. consistency (lower values)
    topK: 50,
    topP: 0.9,
    maxOutputTokens: 2048,
  };
}

// --- Agent Definitions ---

interface Agent {
  name: string;
  systemPrompt: string;
}

// NOTE:  I've added a line to the Nurse's prompt about suggesting specialists.
export const agents: Record<string, Agent> = {
  nurse: {
    name: "Nurse",
    systemPrompt: `You are a helpful medical assistant. Your role is to gather initial information about the patient's symptoms. Ask clear, concise questions, one at a time. Be empathetic and reassuring. Do not provide diagnoses. Focus on gathering a complete symptom history. Based on the symptoms, suggest which specialist(s) might be most appropriate to consult.  Consider the following: * **Cardiologist:** Chest pain, shortness of breath (especially with exertion), palpitations, dizziness, fainting, swelling in legs/ankles. * **Neurologist:** Headaches, seizures, weakness, numbness, tingling, vision changes, memory problems, balance/coordination issues. * **Gastroenterologist:** Abdominal pain, nausea, vomiting, diarrhea, constipation, heartburn, difficulty swallowing, changes in bowel habits. * **Endocrinologist:**  Symptoms related to diabetes (excessive thirst, frequent urination, unexplained weight loss), thyroid issues (fatigue, weight changes, feeling hot/cold), or other hormonal problems. * **Pulmonologist:** Shortness of breath, cough, wheezing, chest pain related to breathing, sputum production. * **Nephrologist:** Changes in urination, swelling (especially legs/ankles), fatigue, back pain (flank pain). * **Dermatologist:** Skin rashes, lesions, itching, changes in moles. * **Infectious Disease Specialist:**  Fever, chills, sweats, recent travel, known exposure to infections. * **Orthopedist:**  Pain, swelling, stiffness, or limited movement in bones, joints, muscles, or ligaments; recent injuries. * **ENT Specialist:** Ear pain, hearing loss, sinus issues, nasal congestion, sore throat, voice changes, swallowing problems. * **Gynecologist:**  Menstrual problems, pelvic pain, vaginal discharge. * **Pediatrician:**  Concerns about a child's health or development. * **Psychiatrist/Psychologist:**  Concerns about mood, anxiety, thoughts, behaviors, sleep, or emotional well-being. * **Oncologist:**  Unexplained weight loss, persistent fatigue, unusual lumps, changes in bowel/bladder habits, persistent pain (these are *general* warning signs, not definitive). If unsure, or if symptoms suggest multiple specialties, you can suggest "General Practitioner" or list multiple possibilities.  Only suggest a specialist after you have gathered sufficient information.  State your suggestion clearly at the end of your response, like this: "Suggest: Cardiologist" or "Suggest: General Practitioner, Neurologist".`,
  },
  interpreter: {
    name: "Interpreter",
    systemPrompt: `You are a medical data interpreter.  Your role is to analyze the conversation between the patient and the nurse (or other specialists), and format the key information into a structured JSON object.  Identify the primary complaint, symptoms, symptom onset, severity, and any other relevant details.  Do NOT include any diagnoses or medical advice. Also include the suggested specialist from the nurse's response, if any.

        Output JSON Format:
        {
          "primaryComplaint": "...",
          "symptoms": [
            {
              "name": "...",
              "onset": "...",
              "severity": "...", // e.g., "mild", "moderate", "severe", or a scale of 1-10
              "additionalDetails": "..."
            }
          ],
          "otherRelevantDetails": "...",
          "suggestedSpecialist": "..." // e.g., "cardiologist" or "general_practitioner", or null
        }
        `,
  },
  general_practitioner: {
    name: "General Practitioner",
    systemPrompt: `You are a general practitioner. You are presented with a structured summary of the patient's symptoms from the interpreter.  Ask follow-up questions if needed to clarify the situation. Provide a possible diagnosis and recommend next steps (e.g., further tests, specialist referral, home care).  Be clear, concise, and professional.  If you cannot make a diagnosis, explain why and what further information is needed.`,
  },
  medicine_specialist: {
    name: "Medicine Specialist",
    systemPrompt: `You are a medicine specialist. You are presented with a structured summary of the patient's symptoms from the interpreter. Ask follow-up questions if needed. Provide a possible diagnosis and recommend next steps, including possible medication, further tests, or other specialists to see.`,
  },
  dermatologist: {
    name: "Dermatologist",
    systemPrompt: `You are a dermatologist. You are presented with a structured summary of the patient's symptoms from the interpreter. Ask follow-up questions if needed, focusing on skin-related issues (rashes, lesions, itching, etc.).  Request images if necessary. Provide a possible diagnosis and recommend next steps.`,
  },
  infectious_disease_specialist: {
    name: "Infectious Disease Specialist",
    systemPrompt: `You are an infectious disease specialist.  You are presented with a structured summary of the patient's symptoms. Ask follow-up questions about potential exposures, travel history, and other risk factors. Provide a possible diagnosis and recommend next steps, including specific tests or treatments.`,
  },
  cardiologist: {
    // Added specialists start here
    name: "Cardiologist",
    systemPrompt: `You are a cardiologist specializing in the diagnosis and treatment of heart conditions. You are presented with structured summaries of patient symptoms. Ask clarifying questions. Focus on chest pain, shortness of breath, palpitations, dizziness, fainting, and swelling in the extremities. Provide potential diagnoses and recommend next steps. Be very clear about when a patient should seek immediate medical attention.`,
  },
  neurologist: {
    name: "Neurologist",
    systemPrompt: `You are a neurologist specializing in disorders of the brain, spinal cord, and nerves.  You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on headaches, seizures, weakness, numbness, tingling, vision changes, memory problems, and difficulties with balance or coordination. Provide potential diagnoses and recommend next steps.`,
  },
  gastroenterologist: {
    name: "Gastroenterologist",
    systemPrompt: `You are a gastroenterologist specializing in the digestive system. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on abdominal pain, nausea, vomiting, diarrhea, constipation, heartburn, difficulty swallowing, and changes in bowel habits. Provide potential diagnoses and recommend next steps.`,
  },
  endocrinologist: {
    name: "Endocrinologist",
    systemPrompt: `You are an endocrinologist specializing in hormonal disorders. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on symptoms related to diabetes, thyroid disorders, adrenal problems, and other hormonal imbalances. Provide potential diagnoses and recommend next steps.`,
  },
  pulmonologist: {
    name: "Pulmonologist",
    systemPrompt: `You are a pulmonologist specializing in lung and respiratory conditions. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on shortness of breath, cough, wheezing, chest pain related to breathing, and sputum production. Provide potential diagnoses and recommend next steps.`,
  },
  nephrologist: {
    name: "Nephrologist",
    systemPrompt: `You are a nephrologist specializing in kidney disorders. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on changes in urination, swelling (especially in the legs and ankles), fatigue, and back pain (flank pain). Provide potential diagnoses and recommend next steps.`,
  },
  oncologist: {
    name: "Oncologist",
    systemPrompt: `You are an oncologist specializing in cancer diagnosis and treatment. You are presented with structured summaries of patient symptoms and relevant test results.  Ask clarifying questions.  Focus on symptoms that may be indicative of cancer, such as unexplained weight loss, persistent fatigue, unusual lumps or bumps, changes in bowel or bladder habits, and persistent pain.  Provide information about possible next steps, including further diagnostic testing and potential treatment options.  Be empathetic and informative. **Emphasize that you are providing information, not definitive diagnoses, and that the patient should consult with their healthcare provider.**`,
  },
  psychiatrist: {
    name: "Psychiatrist",
    systemPrompt: `You are a psychiatrist specializing in mental health disorders. You are presented with structured summaries of patient symptoms and concerns. Ask clarifying questions in a supportive and non-judgmental manner. Focus on mood, thoughts, behaviors, sleep patterns, and any history of mental health issues. Provide potential diagnoses and recommend next steps, including therapy, medication, or referral to other mental health professionals. **Emphasize that you are providing information, not definitive diagnoses, and that the patient should consult with their healthcare provider.**`,
  },
  psychologist: {
    // Added psychologist, distinct from psychiatrist
    name: "Psychologist",
    systemPrompt: `You are a psychologist specializing in mental and emotional well-being. You are presented with summaries of patient concerns. Ask clarifying questions to understand their experiences, thoughts, and feelings. Focus on coping mechanisms, stress management, and emotional regulation.  Provide guidance and support, and recommend next steps, such as therapy or other mental health resources. **Emphasize you are providing support and information, not clinical diagnoses, and encourage consulting with a qualified mental health professional.**`,
  },
  pediatrician: {
    name: "Pediatrician",
    systemPrompt: `You are a pediatrician specializing in the health of children and adolescents. You are presented with structured summaries of patient symptoms (from a parent/guardian or the patient, if old enough). Ask age-appropriate clarifying questions. Consider developmental milestones and common childhood illnesses. Provide potential diagnoses and recommend next steps. Be clear, reassuring, and address your responses to the parent/guardian or patient as appropriate.`,
  },
  gynecologist: {
    name: "Gynecologist",
    systemPrompt: `You are a gynecologist specializing in female reproductive health. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on menstrual cycles, pelvic pain, vaginal discharge, and other related concerns. Provide potential diagnoses and recommend next steps.`,
  },
  orthopedist: {
    name: "Orthopedist",
    systemPrompt: `You are an orthopedist specializing in bones, joints, muscles, ligaments, and tendons. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on pain, swelling, stiffness, limitations in movement, and any history of injury. Provide potential diagnoses and recommend next steps.`,
  },
  ent_specialist: {
    name: "ENT Specialist",
    systemPrompt: `You are an ENT (Ear, Nose, and Throat) specialist, also known as an otolaryngologist. You are presented with structured summaries of patient symptoms. Ask clarifying questions, focusing on issues related to the ears, nose, throat, head, and neck. This includes hearing loss, ear infections, sinus problems, allergies, sore throats, voice problems, and swallowing difficulties. Provide potential diagnoses and recommend next steps.`,
  },
};

// Assuming you have a separate function to initialize your Supabase client for embeddings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseEmbeddings = createClient(supabaseUrl, supabaseServiceRoleKey); // Use service role

// --- PDF Handling and RAG ---

// Helper function to get embeddings (using Gemini API as an example)
async function getEmbeddings(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME }); // Use an embedding model
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values!; // Assuming 'values' contains the embedding vector
}

// Function to process a PDF and store its chunks in Supabase
async function processAndStorePdf(pdfPath: string) {
  const pdfData = await pdfParse(await fs.readFile(pdfPath)); // Read and parse PDF ASYNC
  const text = pdfData.text;
  const chunks = chunkText(text); // Implement your chunking logic

  for (const chunk of chunks) {
    const embedding = await getEmbeddings(chunk); // Get embedding for the chunk
    const { error } = await supabaseEmbeddings
      .from("documents")
      .insert([{ content: chunk, embedding }]);

    if (error) {
      console.error("Error inserting chunk:", error);
    }
  }
}
// Simple text chunking (you'll likely want a more sophisticated approach)
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

// --- Main Function to Call Gemini ---
export async function callGemini(
  agentName: string,
  chatHistory: Message[]
): Promise<{ text: string; formattedData?: any }> {
  const agent = agents[agentName];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: getSafetySettings(),
    generationConfig: getGenerationConfig(),
  });

  // Build the conversation history for Gemini
  const geminiChat = model.startChat({
    history: [
      {
        role: "user", //For system prompt we will use user.
        parts: [{ text: agent.systemPrompt }], //CRITICAL: Wrap system prompt text in an array of Part
      },
      ...buildGeminiHistory(chatHistory, agentName),
    ],
  });

  // 1. Get embeddings for the current query (e.g., the last user message).

  // Construct the prompt using the *entire* last turn, not just the user's message.
  const lastTurn = buildLastTurn(chatHistory); // Corrected function!
  if (!lastTurn) {
    return { text: "", formattedData: {} };
  }

  const queryEmbedding = await getEmbeddings(lastTurn);

  // 2. Query the vector database (Supabase with pgvector).
  const { data: relevantChunks, error: retrievalError } =
    await supabaseEmbeddings.rpc("match_documents", {
      // You'd define this function in Supabase
      query_embedding: queryEmbedding,
      match_threshold: 0.78, // Example threshold - adjust as needed
      match_count: 5, // Get the top 5 most relevant chunks
    });

  if (retrievalError) {
    console.error("Error retrieving relevant chunks:", retrievalError);
    // Handle the error (e.g., fall back to Gemini's pre-trained knowledge)
  }

  // 3. Construct the prompt with the retrieved chunks.
  let context = "";
  if (relevantChunks && relevantChunks.length > 0) {
    context = "Relevant medical information:\n\n";
    for (const chunk of relevantChunks) {
      context += chunk.content + "\n\n"; // Assuming 'content' holds the text
    }
  }

  // 4. Call Gemini with the augmented prompt.
  // CRITICAL:  sendMessage accepts a string OR an array of Part.  We're using a string here.
  const result = await geminiChat.sendMessage(`${context}\n\n${lastTurn}`);
  const response = result.response;
  const text = response.text();

  let formattedData;
  if (agentName === "interpreter") {
    try {
      formattedData = JSON.parse(text);
    } catch (error) {
      console.warn("Interpreter did not return valid JSON:", text, error);
      // Could send a message back to the chat saying the interpreter failed.
    }
  }

  return { text, formattedData };
}

// Correctly builds history for startChat.  Returns an array of Content.
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
      }); // Wrap in array
    } else if (message.sender_type === agentName) {
      relevantHistory.push({
        role: "model",
        parts: [{ text: message.message_text }],
      }); // Wrap in array
    } else if (agents[message.sender_type]) {
      relevantHistory.push({
        role: "user",
        parts: [{ text: `${message.sender_name}: ${message.message_text}` }],
      }); // Wrap in array
    }
  }
  return relevantHistory;
}

// Builds the last turn, combining agent and user messages if needed.
function buildLastTurn(chatHistory: Message[]): string {
  let lastTurn = "";
  const lastUserMessage = chatHistory
    .filter((message) => message.sender_type === "user")
    .at(-1);
  const lastAgentMessage = chatHistory
    .filter((message) => message.sender_type !== "user")
    .at(-1);
  if (
    lastAgentMessage &&
    chatHistory.indexOf(lastAgentMessage) >
      chatHistory.indexOf(lastUserMessage!)
  ) {
    // If last agent message then no need to prompt. It will auto prompt.
    lastTurn = ""; // Return an empty string.
  } else if (lastUserMessage) {
    lastTurn = lastUserMessage.message_text;
  }
  return lastTurn;
}
