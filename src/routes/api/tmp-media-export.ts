import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY one-off export helper — delete after use.
export const Route = createFileRoute("/api/tmp-media-export")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("media")
          .download("f1f7c479-2505-479e-851f-af9e92d01fdb-owner.jpeg");
        if (error || !data) return new Response("not found", { status: 404 });
        return new Response(await data.arrayBuffer(), {
          headers: { "content-type": data.type || "image/jpeg" },
        });
      },
    },
  },
});
