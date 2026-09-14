"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { initialWorkspace } from "@/data/workspace-seed";
import type { BrainSummary, WorkspaceState } from "@/types/workspace";
import { workspaceReducer, type WorkspaceAction } from "./workspace-reducer";
const WorkspaceContext = createContext<{
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  brains: BrainSummary[];
} | null>(null);
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspace);
  const processing = state.documents.some(
    (doc) => doc.status !== "Complete" && doc.status !== "Failed",
  );
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => dispatch({ type: "processing/tick" }), 950);
    return () => clearInterval(timer);
  }, [processing]);
  const brains = useMemo(
    () =>
      state.brains.map((brain) => {
        const docs = state.documents.filter((doc) => doc.brainId === brain.id);
        const ids = new Set(docs.map((doc) => doc.id));
        return {
          ...brain,
          documents: docs.length,
          concepts: state.concepts.filter((concept) =>
            ids.has(concept.documentId),
          ).length,
          flashcards: docs.reduce((sum, doc) => sum + doc.flashcards, 0),
          updated: brain.lastStudied
            ? new Date(brain.lastStudied).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              })
            : "Not studied yet",
        };
      }),
    [state],
  );
  return (
    <WorkspaceContext.Provider value={{ state, dispatch, brains }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider is required");
  return context;
}
