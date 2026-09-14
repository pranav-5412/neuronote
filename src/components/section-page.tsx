"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Check, Monitor, Sun, Moon } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { Button } from "@/components/ui/button";
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
    "Flashcard generation and spaced review arrive in a later phase. Your original study files are ready in Documents.",
  ],
  quizzes: [
    "Turn a little practice into confidence",
    "Quiz sessions and results will be available in a later phase. No quizzes are graded in this preview.",
  ],
  progress: [
    "Every small step will have a place",
    "Detailed mastery, streaks, and learning history arrive with study sessions. Document counts reflect your saved library.",
  ],
  "ai-tutor": [
    "A thoughtful study partner, coming soon",
    "AI-powered conversations will be available in a later phase. This preview does not connect to an AI service.",
  ],
};
const subscribe = () => () => {};
export function SectionPage({ section }: { section: string }) {
  const item = navigation.find((item) => item.href === `/${section}`)!;
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div className="section-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR PERSONAL SECOND BRAIN</div>
          <h1>{item.label}</h1>
          <p>
            {section === "settings"
              ? "A workspace that feels like you."
              : descriptions[section]}
          </p>
        </div>
      </div>
      {section === "settings" ? (
        <>
          <ProfileSettings />
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
                  aria-pressed={mounted && theme === option.id}
                >
                  <option.icon size={22} />
                  <span>{option.label}</span>
                  <span className="theme-check">
                    {mounted && theme === option.id ? (
                      <Check size={16} />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="preview-note mt-6">
              Theme preferences are saved on this device. Your account details
              are saved securely.
            </div>
          </div>
        </>
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
