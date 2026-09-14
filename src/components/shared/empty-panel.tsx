import { Sprout } from "lucide-react";
export function EmptyPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-panel">
      <Sprout size={28} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
