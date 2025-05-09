// lib/types.ts
export interface User {
    id: string;
    name: string;
    age: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    other_info?: any; // Use a more specific type if you know the structure
  }
  
  export interface ChatSession {
    id: string;
    user_id: string;
    chat_id: string;
    created_at: string;
  }
  
  export interface Message {
    id: string;
    chat_session_id: string;
    sender_type: 'user' | 'nurse' | 'interpreter' | 'general_practitioner' | 'medicine_specialist' | 'dermatologist' | 'infectious_disease_specialist' | 'system'; // Expand as needed
    sender_name: string;
    message_text: string;
    sent_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatted_data?: any;
  }