export type BrainIcon =
  "leaf" | "atom" | "flask" | "globe" | "calculator" | "book";
export interface Brain {
  id: string;
  name: string;
  category: string;
  icon: BrainIcon;
  description: string;
  mastery: number;
  streak: number;
  lastStudied: string | null;
  tone: "sage" | "sand" | "lilac" | "rose";
}
export const processingSteps = [
  "Uploading",
  "Uploaded",
  "Validating",
  "Extracting text",
  "Cleaning text",
  "Detecting structure",
  "Organizing passages",
  "Saving text",
  "Complete",
] as const;
export type DocumentStatus =
  | (typeof processingSteps)[number]
  | "Failed"
  | "Unsupported"
  | "Waiting"
  | "Deleting"
  | "Delete failed";
export type FileType =
  "PDF" | "DOCX" | "PPTX" | "TXT" | "Markdown" | "Image" | "Pasted text";
export interface Topic {
  id: string;
  documentId: string;
  name: string;
}
export interface Concept {
  id: string;
  documentId: string;
  topicId: string;
  name: string;
  definition: string;
  mastery: number;
  learnedAt: string;
}
export interface StudyDocument {
  id: string;
  brainId: string;
  name: string;
  type: FileType;
  size: number;
  pages: number | null;
  uploadedAt: string;
  status: DocumentStatus;
  flashcards: number;
  quizzes: number;
  extractedText: string;
  chunkCount: number;
  extractedAt: string | null;
  error?: string;
}
export interface WorkspaceState {
  brains: Brain[];
  documents: StudyDocument[];
  topics: Topic[];
  concepts: Concept[];
}
export type BrainInput = Pick<
  Brain,
  "name" | "category" | "icon" | "description"
>;
export interface BrainSummary extends Brain {
  documents: number;
  concepts: number;
  flashcards: number;
  updated: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
}
export interface WorkspaceSnapshot {
  state: WorkspaceState;
  profile: UserProfile;
}
