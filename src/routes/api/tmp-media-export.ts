import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY one-off export helper — delete after use.
export const Route = createFileRoute("/api/tmp-media-export")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("media")
          .download("5261d992-afe9-40fa-9fd9-d0896c5fc4f7-ChatGPT_Image_Sep_1__2026__03_34_45_PM.png");
        if (error || !data) return new Response(JSON.stringify(error), { status: 404 });
        return new Response(await data.arrayBuffer(), {
          headers: { "content-type": data.type || "image/jpeg" },
        });
      },
    },
  },
});
