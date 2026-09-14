"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Flame,
  ArrowRight,
  Clock3,
  Layers,
  FileText,
  Target,
} from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import type { BrainSummary } from "@/types/workspace";
import { studyExamples } from "@/data/workspace-options";
import { Button } from "@/components/ui/button";
import { EmptyPanel } from "@/components/shared/empty-panel";
import { DocumentLibrary } from "@/components/documents/documents-page";
import { StatusBadge } from "@/components/documents/status-badge";
import { SubjectIcon } from "./subject-icon";
const tabs = [
  "Overview",
  "Documents",
  "Notes",
  "Concepts",
  "Flashcards",
  "Quizzes",
] as const;
export function BrainDetail({
  brain,
  onEdit,
  onDelete,
}: {
  brain: BrainSummary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { state } = useWorkspace();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const docs = state.documents.filter((doc) => doc.brainId === brain.id);
  const ids = new Set(docs.map((doc) => doc.id));
  const concepts = state.concepts.filter((concept) =>
    ids.has(concept.documentId),
  );
  const weak = concepts.filter((concept) => concept.mastery < 50);
  const completed = docs.filter((doc) =>
    ["Complete", "Uploaded"].includes(doc.status),
  );
  const totalQuizzes = docs.reduce((sum, doc) => sum + doc.quizzes, 0);
  const conceptRows = (items: typeof concepts) => (
    <div className="concept-rows">
      {items.map((concept) => (
        <div key={concept.id}>
          <div>
            <strong>{concept.name}</strong>
            <p>{concept.definition}</p>
          </div>
          <span
            className={concept.mastery < 50 ? "weak-score" : "concept-score"}
          >
            {concept.mastery}%
          </span>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <Link href="/my-brain" className="text-link mb-7">
        <ArrowLeft size={14} />
        All brains
      </Link>
      <div className="page-heading brain-detail-heading">
        <div className={`brain-title ${brain.tone}`}>
          <span className="subject-icon">
            <SubjectIcon icon={brain.icon} size={27} />
          </span>
          <div>
            <div className="eyebrow">
              {brain.category.toUpperCase()} · YOUR STUDY WORKSPACE
            </div>
            <h1>{brain.name}</h1>
            <p>
              {brain.description || "A fresh space for your next discovery."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit brain
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete brain"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="brain-summary">
        <div>
          <strong>{brain.mastery}%</strong>
          <span>Overall mastery</span>
        </div>
        <div>
          <strong>{docs.length}</strong>
          <span>Documents</span>
        </div>
        <div>
          <strong>{concepts.length}</strong>
          <span>Concepts</span>
        </div>
        <div>
          <strong>{brain.flashcards}</strong>
          <span>Flashcards</span>
        </div>
        <div>
          <strong>
            <Flame size={18} />
            {brain.streak} days
          </strong>
          <span>Study streak</span>
        </div>
      </div>
      <div className="brain-tabs" role="tablist" aria-label="Brain sections">
        {tabs.map((label, index) => (
          <button
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            id={`tab-${label}`}
            aria-controls="brain-tab-panel"
            aria-selected={tab === label}
            tabIndex={tab === label ? 0 : -1}
            key={label}
            onClick={() => setTab(label)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft")
                next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[next]);
              tabRefs.current[next]?.focus();
            }}
          >
            {label}
            {label === "Documents" && <span>{docs.length}</span>}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="brain-tab-panel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="brain-tab-panel"
      >
        {tab === "Documents" ? (
          <DocumentLibrary initialBrainId={brain.id} embedded />
        ) : !docs.length ? (
          <EmptyPanel
            title="A fresh brain, ready for ideas."
            description="Add a document to start collecting your study material."
          >
            <Button onClick={() => setTab("Documents")}>
              Add your first document
              <ArrowRight />
            </Button>
          </EmptyPanel>
        ) : tab === "Overview" ? (
          <>
            <div className="brain-overview-grid">
              <section className="workspace-panel resume-panel">
                <span className="eyebrow">PICK UP A THREAD</span>
                <h2>
                  {completed[0]?.name.replace(/\.[^.]+$/, "") ??
                    "Your next study session"}
                </h2>
                <p>
                  {completed.length
                    ? "Revisit the source, connect an idea, remember a little more."
                    : "Your upload needs attention. Check the document status."}
                </p>
                <div className="resume-meta">
                  <Clock3 size={14} />
                  Private source material
                </div>
                <Button asChild variant="outline">
                  <Link
                    href={
                      completed[0]
                        ? `/documents?document=${completed[0].id}`
                        : "/documents"
                    }
                  >
                    Continue studying
                    <ArrowRight />
                  </Link>
                </Button>
              </section>
              <section className="workspace-panel">
                <div className="section-title">
                  <h2>Mastery, taking shape</h2>
                  <Target size={17} />
                </div>
                <strong className="large-mastery">
                  {brain.mastery}
                  <span>%</span>
                </strong>
                <div className="progress-track">
                  <div style={{ width: `${brain.mastery}%` }} />
                </div>
                <p>
                  Study tracking arrives later · {brain.updated.toLowerCase()}
                </p>
                <div className="mastery-legend">
                  <span>
                    {concepts.filter((c) => c.mastery >= 80).length} confident
                  </span>
                  <span>{weak.length} need a little care</span>
                </div>
              </section>
              <section className="workspace-panel">
                <div className="section-title">
                  <h2>Recent documents</h2>
                  <button
                    className="text-link"
                    onClick={() => setTab("Documents")}
                  >
                    View all
                    <ArrowRight size={13} />
                  </button>
                </div>
                {docs.slice(0, 3).map((doc) => (
                  <Link
                    key={doc.id}
                    className="mini-document"
                    href={`/documents?document=${doc.id}`}
                  >
                    <FileText size={18} />
                    <span>{doc.name}</span>
                    <StatusBadge status={doc.status} />
                  </Link>
                ))}
              </section>
              <section className="workspace-panel">
                <div className="section-title">
                  <h2>A little practice, soon</h2>
                  <Layers size={17} />
                </div>
                <strong className="review-count">
                  {Math.min(24, brain.flashcards)}{" "}
                  <span>flashcards to revisit</span>
                </strong>
                <p>
                  {brain.flashcards
                    ? studyExamples.reviewDue
                    : "Flashcard generation arrives in a later phase."}
                </p>
                <Link className="text-link" href="/flashcards">
                  Explore flashcards
                  <ArrowRight size={13} />
                </Link>
                <div className="inline-note">
                  Preview schedule · Review sessions arrive later.
                </div>
              </section>
              <section className="workspace-panel">
                <h2>Recently learned</h2>
                {concepts.length ? (
                  conceptRows(concepts.slice(0, 3))
                ) : (
                  <p>Concept extraction arrives in a later phase.</p>
                )}
              </section>
              <section className="workspace-panel">
                <h2>Give these a little attention</h2>
                {weak.length ? (
                  conceptRows(weak.slice(0, 3))
                ) : (
                  <p>No weak concepts in this workspace yet.</p>
                )}
              </section>
            </div>
            <div className="quiz-result">
              <div>
                <span className="eyebrow">MOST RECENT QUIZ</span>
                <h2>
                  {totalQuizzes
                    ? studyExamples.quizTitle
                    : "No quiz results yet"}
                </h2>
              </div>
              <strong>{totalQuizzes ? studyExamples.quizScore : "—"}</strong>
              <Button variant="outline" onClick={() => setTab("Quizzes")}>
                View summary
                <ArrowRight />
              </Button>
            </div>
          </>
        ) : tab === "Concepts" ? (
          <section className="workspace-panel">
            <div className="section-title">
              <h2>Ideas worth connecting</h2>
              <span className="muted">{concepts.length} concepts</span>
            </div>
            {concepts.length ? (
              conceptRows(concepts)
            ) : (
              <EmptyPanel
                title="The first connections are on their way."
                description="Concept extraction arrives in a later phase."
              />
            )}
          </section>
        ) : tab === "Notes" ? (
          <section className="workspace-panel">
            <span className="eyebrow">READ-ONLY STUDY PREVIEW</span>
            <h2>Notes, ready when you are</h2>
            <p>
              Your documents are saved. Note generation arrives in a later
              phase.
            </p>
            <div className="concept-rows">
              {concepts.slice(0, 3).map((concept) => (
                <div key={concept.id}>
                  <div>
                    <strong>{concept.name}</strong>
                    <p>{concept.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="workspace-panel">
            <span className="eyebrow">PRACTICE ARRIVES LATER</span>
            <h2>
              {tab === "Flashcards"
                ? `${brain.flashcards} flashcards in this brain`
                : `${totalQuizzes} quizzes in this brain`}
            </h2>
            <p>
              {tab === "Flashcards"
                ? "Flashcard generation and review sessions arrive in a later phase."
                : "Quiz generation and interactive sessions are outside this phase."}
            </p>
            {tab === "Flashcards" ? (
              <div className="sample-flashcards">
                {concepts.slice(0, 3).map((concept) => (
                  <div key={concept.id}>
                    <span>RECALL PROMPT</span>
                    <h3>What is {concept.name.toLowerCase()}?</h3>
                    <p>{concept.definition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="quiz-result">
                <h3>Your quiz results will appear here</h3>
                <strong>
                  {totalQuizzes ? studyExamples.quizScore : "No results"}
                </strong>
                <span className="muted">Practice arrives later</span>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
