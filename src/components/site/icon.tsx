import * as Lucide from "lucide-react";
import { Sparkles } from "lucide-react";

export function DynamicIcon({
  name,
  className = "size-5",
}: {
  name?: string | null;
  className?: string;
}) {
  const map = Lucide as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const Cmp = (name && map[name]) || Sparkles;
  return <Cmp className={className} />;
}