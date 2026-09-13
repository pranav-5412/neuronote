export interface Brain {
  id: string;
  name: string;
  description: string;
  documents: number;
  concepts: number;
  mastery: number;
  updated: string;
  tone: "sage" | "sand" | "lilac" | "rose";
}
export const brains: Brain[] = [
  {
    id: "biology",
    name: "Biology",
    description: "The little things that make life.",
    documents: 5,
    concepts: 34,
    mastery: 73,
    updated: "2 hours ago",
    tone: "sage",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Making sense of how things move.",
    documents: 3,
    concepts: 22,
    mastery: 58,
    updated: "Yesterday",
    tone: "sand",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "A world of reactions and possibilities.",
    documents: 2,
    concepts: 18,
    mastery: 64,
    updated: "Yesterday",
    tone: "lilac",
  },
  {
    id: "social-science",
    name: "Social Science",
    description: "People, places, and the stories between.",
    documents: 2,
    concepts: 12,
    mastery: 42,
    updated: "2 days ago",
    tone: "rose",
  },
];
export const stats = [
  { label: "Documents", value: "12", detail: "Your source material" },
  { label: "Concepts", value: "86", detail: "Connections taking shape" },
  { label: "Flashcards", value: "241", detail: "Little prompts, big progress" },
  { label: "Quizzes", value: "8", detail: "Put your knowledge to work" },
];
export const activities = [
  {
    id: "1",
    kind: "flashcards",
    title: "A little practice, a lot retained",
    description: "Reviewed 24 flashcards in Cell Biology",
    brain: "Biology",
    time: "2 hours ago",
  },
  {
    id: "2",
    kind: "document",
    title: "New knowledge, added",
    description: "Uploaded Laws of Motion.pdf",
    brain: "Physics",
    time: "Yesterday",
  },
  {
    id: "3",
    kind: "quiz",
    title: "You know your elements",
    description: "Scored 8/10 on Periodic Classification",
    brain: "Chemistry",
    time: "Yesterday",
  },
];
export const studySession = {
  title: "Tissues",
  brain: "Biology",
  mastery: 73,
  subtitle: "Pick up where your curiosity left off.",
  reviewed: 18,
  total: 24,
  minutes: 8,
};
