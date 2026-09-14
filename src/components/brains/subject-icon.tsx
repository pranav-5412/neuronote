import {
  Leaf,
  Atom,
  FlaskConical,
  Globe2,
  Calculator,
  BookOpen,
} from "lucide-react";
import type { BrainIcon } from "@/types/workspace";
const icons = {
  leaf: Leaf,
  atom: Atom,
  flask: FlaskConical,
  globe: Globe2,
  calculator: Calculator,
  book: BookOpen,
};
export function SubjectIcon({
  icon,
  size = 23,
}: {
  icon: BrainIcon;
  size?: number;
}) {
  const Icon = icons[icon];
  return <Icon size={size} strokeWidth={1.5} />;
}
