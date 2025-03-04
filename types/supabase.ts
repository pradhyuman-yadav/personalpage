// types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      passengers: {
        Row: {
          age: number | null;
          arrival_time: string | null; // ISO 8601 timestamp
          board_time: string | null;   // ISO 8601 timestamp
          current_station_id: string | null;
          destination_station_id: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          luggage_size: Database["public"]["Enums"]["luggage_size_enum"] | null;
          origin_station_id: string;
          patience: number | null;
          phone_number: string | null;
          spawn_time: string | null; // ISO 8601 timestamp
          status: Database["public"]["Enums"]["passenger_status"] | null;
          ticket_type: Database["public"]["Enums"]["ticket_type_enum"] | null;
          train_id: string | null;
        };
        Insert: {
          age?: number | null;
          arrival_time?: string | null;
          board_time?: string | null;
          current_station_id?: string | null;
          destination_station_id: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          luggage_size?: Database["public"]["Enums"]["luggage_size_enum"] | null;
          origin_station_id: string;
          patience?: number | null;
          phone_number?: string | null;
          spawn_time?: string | null;
          status?: Database["public"]["Enums"]["passenger_status"] | null;
          ticket_type?: Database["public"]["Enums"]["ticket_type_enum"] | null;
          train_id?: string | null;
        };
        Update: {
          age?: number | null;
          arrival_time?: string | null;
          board_time?: string | null;
          current_station_id?: string | null;
          destination_station_id?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          luggage_size?: Database["public"]["Enums"]["luggage_size_enum"] | null;
          origin_station_id?: string;
          patience?: number | null;
          phone_number?: string | null;
          spawn_time?: string | null;
          status?: Database["public"]["Enums"]["passenger_status"] | null;
          ticket_type?: Database["public"]["Enums"]["ticket_type_enum"] | null;
          train_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "passengers_current_station_id_fkey";
            columns: ["current_station_id"];
            isOneToOne: false;
            referencedRelation: "stations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passengers_destination_station_id_fkey";
            columns: ["destination_station_id"];
            isOneToOne: false;
            referencedRelation: "stations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passengers_origin_station_id_fkey";
            columns: ["origin_station_id"];
            isOneToOne: false;
            referencedRelation: "stations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passengers_train_id_fkey";
            columns: ["train_id"];
            isOneToOne: false;
            referencedRelation: "trains"; // Assuming you'll need trains eventually
            referencedColumns: ["id"];
          },
        ];
      },
      stations: {
        Row: {
          id: string;
          name: string;
          x: number;
          y: number;
          capacity: number | null; // Add this
          current_passengers: number | null; // Add this
          status: string | null; // Operational, Maintenance, etc.  Consider an enum later.
        };
        Insert: {
          id?: string;
          name: string;
          x: number;
          y: number;
          capacity?: number | null;
          current_passengers?: number | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          x?: number;
          y?: number;
          capacity?: number | null;
          current_passengers?: number | null;
          status?: string | null;
        };
        Relationships: [];
      },
       trains: { // simplified trains
        Row: {
          id: string;
          capacity: number;
          current_passengers: number | null;
        };
        Insert: {
          id?: string;
          capacity: number;
          current_passengers?: number | null;
        };
        Update: {
            id?: string;
          capacity?: number;
          current_passengers?: number | null;
        };
        Relationships: [];
      }
    },
    Enums: {
      luggage_size_enum: "small" | "medium" | "large";
      passenger_status: "waiting" | "boarding" | "in_transit" | "arrived" | "exited";
      ticket_type_enum: "single" | "day_pass" | "weekly_pass" | "monthly_pass";
      // Add other enums if you need them later, but keep it minimal for now.
    },
  };
};