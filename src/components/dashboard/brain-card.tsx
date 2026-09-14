import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import type { BrainSummary } from "@/types/workspace";
import { SubjectIcon } from "@/components/brains/subject-icon";
export function BrainCard({ brain }: { brain: BrainSummary }) {
  return (
    <Link
      href={`/my-brain?brain=${brain.id}`}
      className={`brain-card ${brain.tone}`}
    >
      <div className="brain-card-top">
        <span className="subject-icon">
          <SubjectIcon icon={brain.icon} />
        </span>
        <ArrowUpRight className="card-arrow" size={17} />
      </div>
      <h3>{brain.name}</h3>
      <p>{brain.description}</p>
      <div className="brain-meta">
        <span>
          <FileText size={12} />
          {brain.documents} docs
        </span>
        <span>{brain.concepts} concepts</span>
        <span>{brain.flashcards} cards</span>
      </div>
      <div className="brain-mastery">
        <span>Mastery</span>
        <strong>{brain.mastery}%</strong>
      </div>
      <div className="progress-track">
        <div style={{ width: `${brain.mastery}%` }} />
      </div>
      <small>Last studied: {brain.updated}</small>
      <small className="recent-indicator">
        <span />
        {brain.streak
          ? `${brain.streak} day study streak`
          : "Ready for your first session"}
      </small>
    </Link>
  );
}
