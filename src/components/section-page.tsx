"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Plus,
  Brain as BrainIcon,
  Check,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { navigation } from "@/lib/navigation";
import { brains, type Brain } from "@/data/mock-data";
import { BrainCard } from "@/components/dashboard/brain-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
const descriptions: Record<string, string> = {
  documents: "A home for the material that starts it all.",
  notes: "Clear thoughts. Connected ideas. All in one place.",
  "knowledge-graph": "See the connections behind what you know.",
  flashcards: "Build lasting knowledge, one small recall at a time.",
  quizzes: "A little challenge. A clearer picture of what you know.",
  progress: "Make your learning visible.",
  "ai-tutor": "A space to get curious and ask a little more.",
};
const placeholders: Record<string, [string, string]> = {
  documents: [
    "Your source library starts here",
    "Document upload and organization will arrive in a later phase. Your dashboard currently shows sample study material.",
  ],
  notes: [
    "Room for your next big idea",
    "Structured study notes will live here. Note creation and editing are planned for a later phase.",
  ],
  "knowledge-graph": [
    "Knowledge is better connected",
    "Your interactive concept graph will grow here. Graph visualization and concept relationships are planned for a later phase.",
  ],
  flashcards: [
    "Your next recall moment awaits",
    "Flashcard review is planned for a later phase. Your Biology · Tissues session is sample data for the application shell.",
  ],
  quizzes: [
    "Turn a little practice into confidence",
    "Quiz sessions and results will be available in a later phase. No quizzes are graded in this preview.",
  ],
  progress: [
    "Every small step will have a place",
    "Detailed mastery and learning history will arrive in a later phase. Dashboard statistics are illustrative mock data.",
  ],
  "ai-tutor": [
    "A thoughtful study partner, coming soon",
    "AI-powered conversations will be available in a later phase. This preview does not connect to an AI service.",
  ],
};
export function SectionPage({ section }: { section: string }) {
  const item = navigation.find((item) => item.href === `/${section}`)!;
  const params = useSearchParams();
  const router = useRouter();
  const [localBrains, setLocalBrains] = useState<Brain[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const allBrains = [...brains, ...localBrains];
  const selected = allBrains.find((brain) => brain.id === params.get("brain"));
  const showNew = newOpen || params.get("new") === "true";
  function closeNew(open: boolean) {
    setNewOpen(open);
    if (!open) {
      setName("");
      setError("");
      if (params.has("new")) router.replace("/my-brain");
    }
  }
  function createBrain(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = name.trim();
    if (!cleaned) {
      setError("Give your brain a name to get started.");
      return;
    }
    if (
      allBrains.some(
        (brain) => brain.name.toLowerCase() === cleaned.toLowerCase(),
      )
    ) {
      setError("A brain with that name already exists.");
      return;
    }
    setLocalBrains((value) => [
      ...value,
      {
        id: crypto.randomUUID(),
        name: cleaned,
        description: "A fresh space for your next discovery.",
        documents: 0,
        concepts: 0,
        mastery: 0,
        updated: "Just now",
        tone: "lilac",
      },
    ]);
    closeNew(false);
  }
  return (
    <div className="section-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR PERSONAL SECOND BRAIN</div>
          <h1>{selected?.name ?? item.label}</h1>
          <p>
            {section === "my-brain"
              ? "Give every interest a place to grow."
              : section === "settings"
                ? "A workspace that feels like you."
                : descriptions[section]}
          </p>
        </div>
        {section === "my-brain" && (
          <Button onClick={() => setNewOpen(true)}>
            <Plus />
            New brain
          </Button>
        )}
      </div>
      {section === "my-brain" ? (
        <>
          {selected ? (
            <>
              <Link className="text-link mb-6 inline-flex" href="/my-brain">
                <ArrowLeft size={15} />
                All brains
              </Link>
              <div className="workspace-detail">
                <BrainIcon size={28} />
                <h2>{selected.name}</h2>
                <p>{selected.description}</p>
                <div className="detail-stats">
                  <span>
                    <strong>{selected.documents}</strong> Documents
                  </span>
                  <span>
                    <strong>{selected.concepts}</strong> Concepts
                  </span>
                  <span>
                    <strong>{selected.mastery}%</strong> Mastery
                  </span>
                </div>
                <p className="text-sm">
                  {selected.documents
                    ? "This is a sample workspace. Study tools will be added in later phases."
                    : "A fresh brain, ready for ideas. Adding study material is coming in a later phase."}
                </p>
                <Button asChild variant="outline">
                  <Link href="/documents">Explore documents</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="preview-note">
                Demo workspace · New brains are temporary and reset when you
                leave this page.
              </div>
              <div className="brains-grid">
                {allBrains.map((brain) => (
                  <BrainCard key={brain.id} brain={brain} />
                ))}
              </div>
            </>
          )}
          <Dialog open={showNew} onOpenChange={closeNew}>
            <DialogContent>
              <DialogTitle className="text-xl font-semibold">
                Make room for a new interest.
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-muted-foreground">
                Create a temporary brain in this frontend preview.
              </DialogDescription>
              <form onSubmit={createBrain} className="mt-6">
                <label className="text-sm font-medium" htmlFor="brain-name">
                  Brain name
                </label>
                <input
                  id="brain-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={50}
                  placeholder="e.g. Computer Science"
                  className="mt-2 mb-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  aria-describedby={error ? "brain-error" : undefined}
                  aria-invalid={!!error}
                />
                {error && (
                  <p
                    id="brain-error"
                    role="alert"
                    className="mb-3 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}
                <Button className="mt-3 w-full" type="submit">
                  <Plus />
                  Create brain
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      ) : section === "settings" ? (
        <div className="settings-card">
          <h2>Appearance</h2>
          <p>Choose the light that helps you think.</p>
          <div className="theme-options">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className="theme-option"
                aria-label={`${option.label} theme`}
              >
                <option.icon size={22} />
                <span>{option.label}</span>
                <span className="theme-check" suppressHydrationWarning>
                  {theme === option.id ? <Check size={16} /> : null}
                </span>
              </button>
            ))}
          </div>
          <div className="preview-note mt-6">
            Theme preferences are saved on this device. Account settings will
            arrive with authentication in a later phase.
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <item.icon size={30} strokeWidth={1.4} />
          </span>
          <span className="eyebrow">A LITTLE FURTHER DOWN THE ROAD</span>
          <h2>{placeholders[section][0]}</h2>
          <p>{placeholders[section][1]}</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft />
              Back to dashboard
            </Link>
          </Button>
          <span className="phase-badge">Phase 1 · Application foundation</span>
        </div>
      )}
    </div>
  );
}
