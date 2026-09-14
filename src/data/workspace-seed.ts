import type {
  Brain,
  StudyDocument,
  Topic,
  Concept,
  WorkspaceState,
} from "@/types/workspace";
export const categories = [
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Social Science",
  "Computer Science",
  "Other",
];
export const iconOptions = [
  { id: "leaf", label: "Leaf" },
  { id: "atom", label: "Atom" },
  { id: "flask", label: "Flask" },
  { id: "globe", label: "Globe" },
  { id: "calculator", label: "Calculator" },
  { id: "book", label: "Book" },
] as const;
export const fileTypes = [
  "PDF",
  "DOCX",
  "PPTX",
  "TXT",
  "Markdown",
  "Image",
  "Pasted text",
] as const;
export const seedBrains: Brain[] = [
  {
    id: "biology",
    name: "Biology",
    category: "Biology",
    icon: "leaf",
    description: "The little things that make life.",
    mastery: 73,
    streak: 7,
    lastStudied: "2026-09-13T15:30:00Z",
    tone: "sage",
  },
  {
    id: "physics",
    name: "Physics",
    category: "Physics",
    icon: "atom",
    description: "Making sense of how things move.",
    mastery: 58,
    streak: 3,
    lastStudied: "2026-09-12T12:00:00Z",
    tone: "sand",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    category: "Chemistry",
    icon: "flask",
    description: "A world of reactions and possibilities.",
    mastery: 64,
    streak: 4,
    lastStudied: "2026-09-12T10:00:00Z",
    tone: "lilac",
  },
  {
    id: "social-science",
    name: "Social Science",
    category: "Social Science",
    icon: "globe",
    description: "People, places, and the stories between.",
    mastery: 42,
    streak: 2,
    lastStudied: "2026-09-11T09:00:00Z",
    tone: "rose",
  },
];
const sources: [string, string, StudyDocument["type"], number, string[]][] = [
  [
    "biology",
    "Tissues — Chapter 06.pdf",
    "PDF",
    18,
    ["Epithelial tissue", "Connective tissue", "Meristematic tissue"],
  ],
  [
    "biology",
    "Cell Biology — lecture notes.docx",
    "DOCX",
    12,
    ["Cell membrane", "Mitochondria", "Osmosis"],
  ],
  [
    "biology",
    "Life Processes.pptx",
    "PPTX",
    24,
    ["Photosynthesis", "Respiration", "Nutrition"],
  ],
  [
    "biology",
    "Microscope observations.png",
    "Image",
    1,
    ["Cell wall", "Nucleus", "Cytoplasm"],
  ],
  [
    "biology",
    "Revision checklist.md",
    "Markdown",
    0,
    ["Transport in plants", "Xylem", "Phloem"],
  ],
  [
    "physics",
    "Laws of Motion.pdf",
    "PDF",
    16,
    ["Inertia", "Momentum", "Action and reaction"],
  ],
  [
    "physics",
    "Work and Energy.pdf",
    "PDF",
    11,
    ["Kinetic energy", "Potential energy", "Conservation of energy"],
  ],
  [
    "physics",
    "Lab measurements.txt",
    "TXT",
    0,
    ["Displacement", "Velocity", "Acceleration"],
  ],
  [
    "chemistry",
    "Periodic Classification.pdf",
    "PDF",
    14,
    ["Atomic number", "Valence electrons", "Periodic trends"],
  ],
  [
    "chemistry",
    "Chemical reactions.docx",
    "DOCX",
    8,
    ["Oxidation", "Reduction", "Displacement reactions"],
  ],
  [
    "social-science",
    "Democratic Politics.pdf",
    "PDF",
    21,
    ["Federalism", "Power sharing", "Representation"],
  ],
  [
    "social-science",
    "Climate and vegetation.pdf",
    "PDF",
    15,
    ["Monsoon", "Rainfall", "Biodiversity"],
  ],
];
export const conceptDefinitions: Record<string, string> = {
  "Epithelial tissue":
    "A closely packed layer of cells that covers body surfaces and lines internal organs.",
  "Connective tissue":
    "Cells within an extracellular matrix that support, bind, and protect other tissues.",
  "Meristematic tissue":
    "Actively dividing plant cells responsible for growth.",
  Inertia:
    "The tendency of an object to resist a change in its state of motion.",
  Osmosis:
    "The movement of water through a selectively permeable membrane toward a higher solute concentration.",
};
export function mockMaterial(
  document: StudyDocument,
  names = ["Core idea", "Supporting evidence", "Key relationship"],
) {
  const topic: Topic = {
    id: `${document.id}-topic`,
    documentId: document.id,
    name: document.name.replace(/\.[^.]+$/, ""),
  };
  const concepts: Concept[] = names.map((name, index) => ({
    id: `${document.id}-c${index}`,
    documentId: document.id,
    topicId: topic.id,
    name,
    definition:
      conceptDefinitions[name] ??
      `A sample study concept about ${name.toLowerCase()}. Explain it in your own words and connect it to an example from class.`,
    mastery: [84, 62, 38][index % 3],
    learnedAt: document.uploadedAt,
  }));
  return {
    topic,
    concepts,
    text: `${topic.name}\n\nLEARNING OBJECTIVES\nIdentify the key ideas, explain how they relate, and apply them to an everyday example.\n\n${concepts.map((concept, index) => `${index + 1}. ${concept.name}\n${concept.definition}`).join("\n\n")}\n\nCHECK YOUR UNDERSTANDING\nHow do these ideas relate? Describe one example and explain your reasoning.\n\nThis is predefined demo text, not content extracted from your file.`,
  };
}
const documents: StudyDocument[] = sources.map(
  ([brainId, name, type, pages], index) => ({
    id: `doc-${index + 1}`,
    brainId,
    name,
    type,
    pages: pages || null,
    size: Math.round((index + 1) * 128400),
    uploadedAt: `2026-09-${String(13 - Math.floor(index / 2)).padStart(2, "0")}T10:00:00Z`,
    status: index === 11 ? "Failed" : "Complete",
    flashcards: index === 11 ? 0 : 18 + index,
    quizzes: index === 11 ? 0 : 1,
    extractedText: "",
    simulateFailure: false,
    ...(index === 11
      ? {
          error:
            "The demo process stopped while identifying topics. Retry to run the successful simulation.",
        }
      : {}),
  }),
);
const topics: Topic[] = [];
const concepts: Concept[] = [];
for (const [index, doc] of documents.entries()) {
  if (doc.status === "Complete") {
    const result = mockMaterial(doc, sources[index][4]);
    doc.extractedText = result.text;
    topics.push(result.topic);
    concepts.push(...result.concepts);
  }
}
export const initialWorkspace: WorkspaceState = {
  brains: seedBrains,
  documents,
  topics,
  concepts,
};
export const studyExamples = {
  reviewDue: "Tomorrow · 9:00 AM",
  quizScore: "8 / 10",
  quizTitle: "Chapter check-in",
  noteTitle: "The essentials, in your own words",
  noteBody:
    "Start with the central idea, connect it to a familiar example, then explain why it matters. This is a read-only sample note.",
};
