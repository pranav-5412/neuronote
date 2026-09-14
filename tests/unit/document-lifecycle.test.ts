import { beforeEach, expect, test, vi } from "vitest";
const model = vi.hoisted(() => ({
  events: [] as string[],
  failure: "",
  file: false,
  record: null as null | Record<string, unknown>,
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/repositories/session", () => ({
  getSessionContext: async () => ({
    user: { id: "11111111-1111-4111-8111-111111111111" },
    client: {
      from(table: string) {
        let operation = "select";
        let values: Record<string, unknown> = {};
        const execute = async () => {
          if (table === "brains")
            return {
              data: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
              error: null,
            };
          if (operation === "select")
            return { data: model.record, error: null };
          const status = String(values.processing_status || operation);
          model.events.push(`db:${status}`);
          if (
            (model.failure === "finalize" && status === "uploaded") ||
            (model.failure === "metadata-delete" && operation === "delete")
          )
            return { data: null, error: { code: "test_failure" } };
          if (operation === "insert")
            model.record = { ...values, updated_at: new Date().toISOString() };
          if (operation === "update" && model.record)
            model.record = { ...model.record, ...values };
          if (operation === "delete") model.record = null;
          return {
            data: { id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" },
            error: null,
          };
        };
        const query = {
          select() {
            return query;
          },
          eq() {
            return query;
          },
          maybeSingle: execute,
          single: execute,
          insert(input: Record<string, unknown>) {
            operation = "insert";
            values = input;
            return query;
          },
          update(input: Record<string, unknown>) {
            operation = "update";
            values = input;
            return query;
          },
          delete() {
            operation = "delete";
            return query;
          },
          then(
            resolve: (value: Awaited<ReturnType<typeof execute>>) => unknown,
            reject: (reason: unknown) => unknown,
          ) {
            return execute().then(resolve, reject);
          },
        };
        return query;
      },
      storage: {
        from() {
          return {
            async upload() {
              model.events.push("storage:upload");
              if (model.failure === "upload")
                return { error: { message: "test" } };
              model.file = true;
              return { error: null };
            },
            async remove() {
              model.events.push("storage:remove");
              if (
                model.failure === "storage-delete" ||
                !["upload_failed", "deleting", "delete_failed"].includes(
                  String(model.record?.processing_status),
                )
              )
                return { error: { message: "test" } };
              model.file = false;
              return { error: null };
            },
          };
        },
      },
    },
  }),
}));
import { uploadDocument, deleteDocument } from "@/lib/services/documents";
const brain = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const documentId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const upload = () =>
  uploadDocument(
    new File(["Lecture notes"], "lecture.txt", { type: "text/plain" }),
    brain,
  );
beforeEach(() => {
  model.events = [];
  model.failure = "";
  model.file = false;
  model.record = null;
});
test("only reports uploaded after both storage and metadata succeed", async () => {
  await upload();
  expect(model.file).toBe(true);
  expect(model.record?.processing_status).toBe("uploaded");
  expect(model.events).toEqual([
    "db:uploading",
    "storage:upload",
    "db:uploaded",
  ]);
});
test.each(["upload", "finalize"])(
  "failed %s keeps recoverable metadata and authorizes cleanup first",
  async (failure) => {
    model.failure = failure;
    await expect(upload()).rejects.toThrow(/upload/i);
    expect(model.file).toBe(false);
    expect(model.record?.processing_status).toBe("upload_failed");
    expect(model.events.indexOf("db:upload_failed")).toBeLessThan(
      model.events.indexOf("storage:remove"),
    );
  },
);
function existing() {
  model.record = {
    id: documentId,
    storage_path: "user/document/source.txt",
    processing_status: "uploaded",
    updated_at: "2020-01-01",
  };
  model.file = true;
}
test("deletes storage before metadata", async () => {
  existing();
  await deleteDocument(documentId);
  expect(model.events).toEqual(["db:deleting", "storage:remove", "db:delete"]);
  expect(model.record).toBeNull();
  expect(model.file).toBe(false);
});
test("failed storage removal retains the row and supports retry", async () => {
  existing();
  model.failure = "storage-delete";
  await expect(deleteDocument(documentId)).rejects.toThrow(/retry/i);
  expect(model.record?.processing_status).toBe("delete_failed");
  expect(model.file).toBe(true);
  expect(model.events).not.toContain("db:delete");
  model.failure = "";
  await deleteDocument(documentId);
  expect(model.record).toBeNull();
  expect(model.file).toBe(false);
});
test("failed metadata removal remains visible and retryable after file removal", async () => {
  existing();
  model.failure = "metadata-delete";
  await expect(deleteDocument(documentId)).rejects.toThrow(/retry/i);
  expect(model.record?.processing_status).toBe("delete_failed");
  expect(model.file).toBe(false);
  model.failure = "";
  await deleteDocument(documentId);
  expect(model.record).toBeNull();
});
test("does not delete an active upload", async () => {
  existing();
  model.record = {
    ...model.record,
    processing_status: "uploading",
    updated_at: new Date().toISOString(),
  };
  await expect(deleteDocument(documentId)).rejects.toThrow(/two minutes/i);
  expect(model.events).toEqual([]);
});
