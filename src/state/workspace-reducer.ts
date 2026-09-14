import type { Brain, StudyDocument, WorkspaceState } from "@/types/workspace";
import { processingSteps } from "@/types/workspace";
import { mockMaterial } from "@/data/workspace-seed";
export type WorkspaceAction =
  | { type: "brain/save"; brain: Brain }
  | { type: "brain/delete"; id: string }
  | { type: "document/add"; documents: StudyDocument[] }
  | {
      type: "document/update";
      id: string;
      patch: Pick<StudyDocument, "name" | "brainId">;
    }
  | { type: "document/delete"; id: string }
  | { type: "document/reprocess"; id: string }
  | { type: "processing/tick" };
function removeMaterials(state: WorkspaceState, ids: Set<string>) {
  return {
    ...state,
    topics: state.topics.filter((topic) => !ids.has(topic.documentId)),
    concepts: state.concepts.filter((concept) => !ids.has(concept.documentId)),
  };
}
export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "brain/save":
      return {
        ...state,
        brains: state.brains.some((brain) => brain.id === action.brain.id)
          ? state.brains.map((brain) =>
              brain.id === action.brain.id ? action.brain : brain,
            )
          : [...state.brains, action.brain],
      };
    case "brain/delete": {
      const ids = new Set(
        state.documents
          .filter((doc) => doc.brainId === action.id)
          .map((doc) => doc.id),
      );
      return {
        ...removeMaterials(state, ids),
        brains: state.brains.filter((brain) => brain.id !== action.id),
        documents: state.documents.filter((doc) => !ids.has(doc.id)),
      };
    }
    case "document/add":
      return {
        ...state,
        documents: [
          ...action.documents.filter((doc) =>
            state.brains.some((brain) => brain.id === doc.brainId),
          ),
          ...state.documents,
        ],
      };
    case "document/update":
      return state.brains.some((brain) => brain.id === action.patch.brainId)
        ? {
            ...state,
            documents: state.documents.map((doc) =>
              doc.id === action.id ? { ...doc, ...action.patch } : doc,
            ),
          }
        : state;
    case "document/delete":
      return {
        ...removeMaterials(state, new Set([action.id])),
        documents: state.documents.filter((doc) => doc.id !== action.id),
      };
    case "document/reprocess":
      return {
        ...removeMaterials(state, new Set([action.id])),
        documents: state.documents.map((doc) =>
          doc.id === action.id
            ? {
                ...doc,
                status: "Waiting",
                flashcards: 0,
                quizzes: 0,
                extractedText: "",
                error: undefined,
                simulateFailure: false,
              }
            : doc,
        ),
      };
    case "processing/tick": {
      let next = { ...state };
      const documents = state.documents.map<StudyDocument>((doc) => {
        if (doc.status === "Complete" || doc.status === "Failed") return doc;
        const index = processingSteps.indexOf(doc.status);
        if (doc.simulateFailure && doc.status === "Finding concepts")
          return {
            ...doc,
            status: "Failed",
            error:
              "Demo interruption: concept detection paused. Retry to complete the simulation.",
          };
        const status = processingSteps[index + 1];
        const updated = { ...doc, status };
        if (status === "Complete") {
          const result = mockMaterial(doc);
          next = {
            ...next,
            topics: [...next.topics, result.topic],
            concepts: [...next.concepts, ...result.concepts],
          };
          return {
            ...updated,
            extractedText: doc.sourceText || result.text,
            flashcards: 12,
            quizzes: 1,
          };
        }
        return updated;
      });
      return { ...next, documents };
    }
  }
}
