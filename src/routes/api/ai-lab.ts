import { createFileRoute } from "@tanstack/react-router";
import { handleAiLab } from "@/lib/ai-lab.server";

export const Route = createFileRoute("/api/ai-lab")({
  server: { handlers: { POST: ({ request }) => handleAiLab(request) } },
});
