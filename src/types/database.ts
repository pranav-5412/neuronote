// Generated from supabase/migrations by npm run db:types. Do not edit.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      brains: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          icon: string;
          description: string;
          tone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string;
          icon?: string;
          description?: string;
          tone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          icon?: string;
          description?: string;
          tone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brains_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      concept_connections: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          source_concept_id: string;
          target_concept_id: string;
          relationship: string;
          strength: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          source_concept_id: string;
          target_concept_id: string;
          relationship: string;
          strength?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          source_concept_id?: string;
          target_concept_id?: string;
          relationship?: string;
          strength?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "concept_connections_source_concept_id_brain_id_user_id_fkey";
            columns: ["source_concept_id", "brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "concepts";
            referencedColumns: ["id", "brain_id", "user_id"];
          },
          {
            foreignKeyName: "concept_connections_target_concept_id_brain_id_user_id_fkey";
            columns: ["target_concept_id", "brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "concepts";
            referencedColumns: ["id", "brain_id", "user_id"];
          },
          {
            foreignKeyName: "concept_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      concepts: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          source_document_id: string | null;
          name: string;
          definition: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          source_document_id?: string | null;
          name: string;
          definition?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          source_document_id?: string | null;
          name?: string;
          definition?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "concepts_brain_id_user_id_fkey";
            columns: ["brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "brains";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "concepts_source_document_id_user_id_fkey";
            columns: ["source_document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "concepts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      document_chunks: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          ordinal: number;
          content: string;
          page_start: number | null;
          page_end: number | null;
          token_count: number | null;
          created_at: string;
          updated_at: string;
          section_title: string | null;
          heading_path: string[];
          character_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          ordinal: number;
          content: string;
          page_start?: number | null;
          page_end?: number | null;
          token_count?: number | null;
          created_at?: string;
          updated_at?: string;
          section_title?: string | null;
          heading_path?: string[];
          character_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          ordinal?: number;
          content?: string;
          page_start?: number | null;
          page_end?: number | null;
          token_count?: number | null;
          created_at?: string;
          updated_at?: string;
          section_title?: string | null;
          heading_path?: string[];
          character_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_user_id_fkey";
            columns: ["document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "document_chunks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          original_filename: string;
          display_name: string;
          file_type: Database["public"]["Enums"]["document_file_type"];
          mime_type: string;
          file_size: number;
          storage_path: string;
          page_count: number | null;
          processing_status: Database["public"]["Enums"]["document_status"];
          processing_progress: number;
          processing_error: string | null;
          created_at: string;
          updated_at: string;
          processing_run_id: string | null;
          processing_started_at: string | null;
          extracted_pages: Json;
          extracted_character_count: number;
          chunk_count: number;
          extracted_at: string | null;
          extraction_version: string | null;
          extraction_warnings: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          original_filename: string;
          display_name: string;
          file_type: Database["public"]["Enums"]["document_file_type"];
          mime_type: string;
          file_size: number;
          storage_path: string;
          page_count?: number | null;
          processing_status?: Database["public"]["Enums"]["document_status"];
          processing_progress?: number;
          processing_error?: string | null;
          created_at?: string;
          updated_at?: string;
          processing_run_id?: string | null;
          processing_started_at?: string | null;
          extracted_pages?: Json;
          extracted_character_count?: number;
          chunk_count?: number;
          extracted_at?: string | null;
          extraction_version?: string | null;
          extraction_warnings?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          original_filename?: string;
          display_name?: string;
          file_type?: Database["public"]["Enums"]["document_file_type"];
          mime_type?: string;
          file_size?: number;
          storage_path?: string;
          page_count?: number | null;
          processing_status?: Database["public"]["Enums"]["document_status"];
          processing_progress?: number;
          processing_error?: string | null;
          created_at?: string;
          updated_at?: string;
          processing_run_id?: string | null;
          processing_started_at?: string | null;
          extracted_pages?: Json;
          extracted_character_count?: number;
          chunk_count?: number;
          extracted_at?: string | null;
          extraction_version?: string | null;
          extraction_warnings?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "documents_brain_id_user_id_fkey";
            columns: ["brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "brains";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcard_reviews: {
        Row: {
          id: string;
          user_id: string;
          flashcard_id: string;
          rating: number;
          reviewed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flashcard_id: string;
          rating: number;
          reviewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flashcard_id?: string;
          rating?: number;
          reviewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_user_id_fkey";
            columns: ["flashcard_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "flashcard_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          concept_id: string | null;
          source_document_id: string | null;
          front: string;
          back: string;
          due_at: string | null;
          interval_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          concept_id?: string | null;
          source_document_id?: string | null;
          front: string;
          back: string;
          due_at?: string | null;
          interval_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          concept_id?: string | null;
          source_document_id?: string | null;
          front?: string;
          back?: string;
          due_at?: string | null;
          interval_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_brain_id_user_id_fkey";
            columns: ["brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "brains";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "flashcards_concept_id_user_id_fkey";
            columns: ["concept_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "concepts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "flashcards_source_document_id_user_id_fkey";
            columns: ["source_document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "flashcards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mastery_records: {
        Row: {
          id: string;
          user_id: string;
          concept_id: string;
          score: number;
          evidence_count: number;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          concept_id: string;
          score?: number;
          evidence_count?: number;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          concept_id?: string;
          score?: number;
          evidence_count?: number;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mastery_records_concept_id_user_id_fkey";
            columns: ["concept_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "concepts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "mastery_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          source_document_id: string | null;
          title: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          source_document_id?: string | null;
          title: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          source_document_id?: string | null;
          title?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_brain_id_user_id_fkey";
            columns: ["brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "brains";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "notes_source_document_id_user_id_fkey";
            columns: ["source_document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          answers: Json;
          score: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          answers?: Json;
          score?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          answers?: Json;
          score?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_user_id_fkey";
            columns: ["quiz_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          ordinal: number;
          prompt: string;
          question_type: string;
          options: Json;
          answer: Json;
          explanation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          ordinal: number;
          prompt: string;
          question_type: string;
          options?: Json;
          answer: Json;
          explanation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          ordinal?: number;
          prompt?: string;
          question_type?: string;
          options?: Json;
          answer?: Json;
          explanation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_user_id_fkey";
            columns: ["quiz_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "quiz_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          brain_id: string;
          source_document_id: string | null;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_id: string;
          source_document_id?: string | null;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_id?: string;
          source_document_id?: string | null;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_brain_id_user_id_fkey";
            columns: ["brain_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "brains";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "quizzes_source_document_id_user_id_fkey";
            columns: ["source_document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "quizzes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_document_extraction: {
        Args: {
          p_document_id: string;
          p_run_id: string;
          p_pages: Json;
          p_chunks: Json;
          p_version: string;
          p_warnings: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      document_file_type:
        "PDF" | "DOCX" | "PPTX" | "TXT" | "Markdown" | "Image" | "Pasted text";
      document_status:
        | "uploading"
        | "uploaded"
        | "upload_failed"
        | "deleting"
        | "delete_failed"
        | "queued"
        | "processing"
        | "complete"
        | "failed"
        | "validating"
        | "extracting"
        | "cleaning"
        | "structuring"
        | "chunking"
        | "saving"
        | "unsupported";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
