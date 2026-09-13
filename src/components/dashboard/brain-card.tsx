import Link from "next/link";
import {
  ArrowUpRight,
  Leaf,
  Atom,
  FlaskConical,
  Globe2,
  FileText,
} from "lucide-react";
import type { Brain } from "@/data/mock-data";
const icons = { sage: Leaf, sand: Atom, lilac: FlaskConical, rose: Globe2 };
export function BrainCard({ brain }: { brain: Brain }) {
  const Icon = icons[brain.tone];
  return (
    <Link
      href={`/my-brain?brain=${brain.id}`}
      className={`brain-card ${brain.tone}`}
    >
      <div className="brain-card-top">
        <span className="subject-icon">
          <Icon size={23} strokeWidth={1.5} />
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
      </div>
      <div className="brain-mastery">
        <span>Mastery</span>
        <strong>{brain.mastery}%</strong>
      </div>
      <div className="progress-track">
        <div style={{ width: `${brain.mastery}%` }} />
      </div>
      <small>Opened {brain.updated.toLowerCase()}</small>
    </Link>
  );
}
