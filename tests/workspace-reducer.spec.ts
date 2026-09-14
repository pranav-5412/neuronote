import { test, expect } from "@playwright/test";
import { initialWorkspace } from "../src/data/workspace-seed";
import { workspaceReducer } from "../src/state/workspace-reducer";
import type { WorkspaceState } from "../src/types/workspace";
test("deleting a processing brain cannot leave orphaned documents or concepts", () => {
  let state: WorkspaceState = structuredClone(initialWorkspace);
  state = workspaceReducer(state, { type: "document/reprocess", id: "doc-1" });
  state = workspaceReducer(state, { type: "brain/delete", id: "biology" });
  for (let i = 0; i < 12; i++)
    state = workspaceReducer(state, { type: "processing/tick" });
  const ids = new Set(state.documents.map((doc) => doc.id));
  expect(state.documents.some((doc) => doc.brainId === "biology")).toBe(false);
  expect(state.concepts.every((c) => ids.has(c.documentId))).toBe(true);
  expect(state.topics.every((t) => ids.has(t.documentId))).toBe(true);
});
test("retry completes once and moving retains material without duplicates", () => {
  let state = structuredClone(initialWorkspace);
  state = workspaceReducer(state, { type: "document/reprocess", id: "doc-12" });
  for (let i = 0; i < 15; i++)
    state = workspaceReducer(state, { type: "processing/tick" });
  expect(state.documents.find((doc) => doc.id === "doc-12")?.status).toBe(
    "Complete",
  );
  expect(state.concepts.filter((c) => c.documentId === "doc-12")).toHaveLength(
    3,
  );
  state = workspaceReducer(state, {
    type: "document/update",
    id: "doc-12",
    patch: { name: "Moved document.pdf", brainId: "biology" },
  });
  expect(state.concepts.filter((c) => c.documentId === "doc-12")).toHaveLength(
    3,
  );
  state = workspaceReducer(state, { type: "document/delete", id: "doc-12" });
  expect(state.concepts.filter((c) => c.documentId === "doc-12")).toHaveLength(
    0,
  );
});
