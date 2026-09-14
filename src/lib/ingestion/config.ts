export const INGESTION = {
  maxFileBytes: 25 * 1024 * 1024,
  maxCharacters: 2_000_000,
  maxPages: 300,
  maxChunks: 1500,
  targetTokens: 500,
  maxTokens: 700,
  overlapTokens: 60,
  timeoutMs: 90_000,
  leaseMs: 120_000,
  maxWorkers: 2,
  version: "1",
} as const;
export const activeStages = [
  "validating",
  "extracting",
  "cleaning",
  "structuring",
  "chunking",
  "saving",
] as const;
export type ProcessingStage = (typeof activeStages)[number];
export const stageLabels: Record<ProcessingStage, string> = {
  validating: "Validating",
  extracting: "Extracting text",
  cleaning: "Cleaning text",
  structuring: "Detecting structure",
  chunking: "Organizing passages",
  saving: "Saving text",
};
