<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- AI chat/lab (`src/lib/ai-lab.server.ts`) uses the Lovable AI Gateway when `LOVABLE_API_KEY` is present, and otherwise falls back to direct provider APIs (`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY`, tried in that order with next-provider failover) — this is what makes real AI work on the self-hosted Cloudflare Worker, where the Lovable key cannot exist. `src/server.ts` binds those env names into `process.env` on Cloudflare; model names are overridable via `OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GOOGLE_MODEL`.
