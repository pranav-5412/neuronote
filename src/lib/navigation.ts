import {
  LayoutDashboard,
  Brain,
  Files,
  NotebookPen,
  Network,
  Layers,
  ListChecks,
  ChartNoAxesCombined,
  Sparkles,
  Settings,
} from "lucide-react";
export const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Brain", href: "/my-brain", icon: Brain },
  { label: "Documents", href: "/documents", icon: Files },
  { label: "Notes", href: "/notes", icon: NotebookPen },
  { label: "Knowledge Graph", href: "/knowledge-graph", icon: Network },
  { label: "Flashcards", href: "/flashcards", icon: Layers },
  { label: "Quizzes", href: "/quizzes", icon: ListChecks },
  { label: "Progress", href: "/progress", icon: ChartNoAxesCombined },
  { label: "AI Tutor", href: "/ai-tutor", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];
