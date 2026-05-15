# form-copilot

AI preparation assistant for U.S. DS-160 visa applications.

- Strategy: [`design.md`](./design.md)
- 12-week MVP plan: [`mvp-build.md`](./mvp-build.md)

## Layout

```
form-copilot/
├── design.md           strategy doc
├── mvp-build.md        12-week build plan
└── web/                Next.js 15 app, deployed to Cloudflare Workers via OpenNext
    └── src/app/
        ├── page.tsx                  DS-160 photo checker (Phase 1 wedge)
        └── api/check-photo/route.ts  Anthropic Sonnet vision call
```

## Local development

```bash
cd web
cp .dev.vars.example .dev.vars     # paste your Anthropic API key
npm install
npm run dev                         # next dev → http://localhost:3000
```

For environments closer to production (runs the OpenNext-bundled worker locally):

```bash
npm run preview                     # opennextjs-cloudflare build && wrangler dev
```

## Cloudflare deployment (one-time setup)

1. **Install wrangler & log in**

   ```bash
   cd web
   npx wrangler login
   ```

2. **Set the OpenAI secret**

   ```bash
   npx wrangler secret put OPENAI_API_KEY
   # paste sk-...
   ```

3. **Deploy**

   ```bash
   npm run deploy
   ```

   On first deploy, Cloudflare creates a Worker named `form-copilot-web` and gives you a `*.workers.dev` URL.

4. **Attach the custom domain** (`formcopilot.net`)

   In the Cloudflare dashboard:
   - Add `formcopilot.net` as a site (proxy via Cloudflare DNS)
   - Workers & Pages → `form-copilot-web` → Settings → **Domains & Routes** → Add Custom Domain → `formcopilot.net` (and `www.formcopilot.net`)
   - DNS records are added automatically

5. **Subsequent deploys**

   ```bash
   npm run deploy
   ```

## Cost (current scale)

- Cloudflare Workers free tier: 100k requests/day
- OpenAI gpt-5.4-mini vision: ~$0.003 per photo check (verify against current pricing)
- Domain (`formcopilot.net`): ~$10/year

## What's next

See [`mvp-build.md`](./mvp-build.md) for Phase 2 (document extraction) onward.
