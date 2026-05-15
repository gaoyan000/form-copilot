# Form Copilot — MVP Build Plan (12 weeks)

## Sequencing principle

Build in the order that **kills the biggest risk earliest**, not the order that's easiest to design.

The risks, ranked:
1. **Distribution risk** — can we get traffic at all? *(Photo checker validates this first)*
2. **Extraction risk** — is Vision LLM accurate enough on passports/I-20s to skip manual entry? *(If not, the whole UX changes)*
3. **Intake UX risk** — will users actually complete a conversational intake? *(If they bail at q5, rebuild as a guided form)*
4. **Willingness-to-pay risk** — will the F1 student segment pay $29? *(Validates the whole thesis)*
5. **Voice interview prep quality** — feature risk, not existential

Build order maps to that ranking. Don't build family workspace before you know intake works.

---

## Tech stack (opinionated, picked for speed)

| Layer | Pick | Why |
|---|---|---|
| Frontend | **Next.js 15 (App Router) on Vercel** | Fastest path, good DX, edge-ready |
| Auth | **Clerk** | Drop-in, magic links + Google + WeChat (via custom OAuth) |
| DB | **Postgres on Neon** | Branching for migrations, generous free tier |
| File storage | **Cloudflare R2** | No egress fees; passport scans are read often |
| LLM — vision | **Claude Sonnet 4.6** primary, GPT-5 fallback | A/B on a held-out passport set |
| LLM — text | **Sonnet 4.6** for intake & validation, **Haiku 4.5** for cheap classification | Cost discipline |
| LLM — voice | **OpenAI Realtime API** | Only viable option for low-latency voice today |
| Payments | **Stripe** | $29 / $79 / $129, no subscription in MVP |
| Email | **Resend** | Photo-checker results, magic links |
| i18n | **next-intl** | EN + zh-CN at launch |
| Analytics | **PostHog** | Funnels for photo→signup→pay |
| Errors | **Sentry** | Standard |
| UI | **shadcn/ui + Tailwind** | Skip designer for MVP |

**Encryption**: passport/SEVIS files encrypted at rest (R2 server-side encryption) + per-user encryption envelope; keys in a managed KMS. Don't roll your own crypto.

**Inference budget**: aim for **<$2 of LLM cost per paying user** at the $29 tier. Track per-user cost in PostHog. If it drifts above, switch heavier prompts to Haiku or cache aggressively.

---

## Week 0 — Setup (3–5 days)

Before any product code:

- [ ] Register `formcopilot.app` (or chosen domain), set up Cloudflare DNS
- [ ] Accounts: Vercel, Neon, R2, Clerk, Stripe, Anthropic, OpenAI, Resend, PostHog, Sentry
- [ ] **Immigration attorney consultation (1 hour, ~$300–500)** — review disclaimer wording, UPL exposure for the photo checker and form prep tool. *Do this before the photo checker ships.*
- [ ] **Fill out a real DS-160 yourself, end to end** — document every field, every weird interaction, every error you hit. This is irreplaceable research.
- [ ] Pick the **30 highest-error-rate fields** (the ones agents/Reddit posts complain about most). These define intake scope.
- [ ] Build a **test set of 50 anonymized passports + 20 I-20s** for vision evals (use your own + ask 10 friends, signed consent form)
- [ ] Set up evals harness: a script that runs Vision LLM against the test set and reports per-field accuracy. **You will use this every week.**

---

## Phase 1 — Photo Checker (Weeks 1–2)

**Goal:** ship the lead magnet, validate distribution, build the email list.

### Build
- Standalone landing page at `formcopilot.app/photo` (no auth required)
- Drag-drop or camera upload
- Vision LLM call with structured prompt:
  - dimensions (after auto-crop): 600×600
  - background: white/off-white?
  - head height: 50–69% of frame?
  - eyes: visible, looking at camera?
  - expression: neutral?
  - lighting: even, no harsh shadows?
- Output: pass/fail per criterion + specific text fix
- Optional: client-side auto-crop to 600×600 (browser canvas)
- Email capture: "Get your result + a checklist for retakes"
- Bilingual (EN + zh-CN)

### Distribute
- 5 Xiaohongshu posts: "Your DS-160 photo will probably be rejected"
- 3 Reddit posts in r/f1visa, r/USCIS, r/immigration (be helpful, link photo checker as PS)
- 1 short YouTube video
- WeChat: post in 3 student groups for fall 2026 admits

### Exit criteria (end of week 2)
- 1,000 unique photo checks run
- 200 emails captured
- ≥1 piece of content with >5K views or >100 upvotes

### Go/no-go
- **<500 photo checks** → distribution thesis is broken. Stop and fix that before building more product.
- **≥1,000** → continue to Phase 2 with confidence the audience exists.

---

## Phase 2 — Document Extraction (Weeks 3–4)

**Goal:** prove Vision LLM can extract passport + I-20 data reliably enough that users only have to *confirm*, not *type*.

### Build
- Auth (Clerk magic links + Google + WeChat OAuth)
- Upload UI: passport bio page, I-20 page 1, prior visa (optional)
- R2 upload via signed URLs, files encrypted at rest
- Vision LLM extraction → structured JSON
  - Passport: surname, given names, passport number, nationality, DOB, sex, issue date, expiry date, place of birth
  - I-20: SEVIS ID, school name, school code, program start, program end, funding source, financial amounts
- Confidence score per field
- Confirmation UI: every extracted field shown next to source image, user clicks ✓ or edits

### Eval (do this constantly)
- Run Vision LLM against the 50-passport test set after every prompt change
- Track per-field accuracy
- **Bar to pass: 90%+ accuracy on bio fields, 95%+ on numbers (passport #, SEVIS #, dates)**

### Exit criteria (end of week 4)
- 10 real users (recruited from photo-checker email list) successfully upload + confirm their docs
- Time-to-confirmed-profile < 5 minutes
- <10% of confirmations involve user *correcting* a field (not just accepting)

### Go/no-go
- **<85% extraction accuracy** → reconsider: fall back to Textract/Document AI for structured fields, or accept manual entry as primary path with AI as "double-check"
- **≥90% accuracy** → proceed. The whole UX is now possible.

---

## Phase 3 — Conversational Intake (Weeks 5–6)

**Goal:** prove users will complete a guided intake flow that maps to the 30 highest-error-rate DS-160 fields.

### Build
- Decision: **start with a guided form, not free-chat.** Chat is harder to control, harder to validate, harder to translate. Use plain-language questions in a structured wizard. Add chat-style "ask me anything about this question" as a sidecar.
- Cover the 30 fields in ~12–15 grouped questions (e.g., "Tell us about your last 5 years of travel" → fills 10 DS-160 history fields)
- Pre-fill from extracted documents wherever possible
- Bilingual (EN + zh-CN)
- Question-level help: "Why does the consulate ask this?" with a 1-sentence answer (vetted with attorney for the riskier ones)
- Save state aggressively (every change → server)

### Eval
- Recruit 10 users (compensate them — $20 each is fair) to complete intake
- Watch them via Maze or just live screenshare
- Measure: completion rate, time to complete, drop-off points, correction rate after auto-fill

### Exit criteria
- ≥80% of test users complete intake in <30 minutes
- Output JSON, when manually compared to what they'd have entered in CEAC, matches in ≥95% of fields

### Go/no-go
- **Heavy drop-off mid-flow** → questions are too long or too jargony; rewrite, retest before moving on
- **High correction rate** → auto-fill is hurting more than helping; show extracted values but require explicit accept

---

## Phase 4 — Validation + Output (Weeks 7–8)

**Goal:** cross-check the profile and produce something the user can take into CEAC.

### Build
- **Deterministic validators** (write these as plain code, not LLM):
  - Passport expiry must be ≥6 months past planned travel
  - SEVIS dates must align with I-20 dates
  - Travel history dates must be chronological
  - Country codes valid
  - Date formats consistent
- **LLM validators** (for fuzzy issues):
  - Employer name in resume vs. intake — same entity?
  - Address format consistent across documents?
  - Any unexplained employment gaps >3 months?
- **Risk flag UX** (per design.md §8 — never predict outcomes):
  > "Your last visa expired in 2023 and you're applying again in 2026. The consulate may ask why you didn't travel. Consider preparing an explanation."
- **Printable PDF cheat sheet**:
  - Every DS-160 field with its value
  - Section-by-section, in CEAC's order
  - Bilingual labels (EN + zh-CN)
  - Disclaimer footer on every page
  - Generate server-side with Puppeteer or @react-pdf/renderer

### Exit criteria
- 5 users use the cheat sheet to fill CEAC themselves; report time-to-complete and any field they had to look up

---

## Phase 5 — Payment + Family + Soft Launch (Weeks 9–10)

**Goal:** first paying customers.

### Build
- Stripe Checkout: $29 single, $79 family (up to 5)
- Pricing page (bilingual)
- Family workspace: same logged-in user can create up to 5 applicant profiles, shared address/employer/travel auto-fills with per-applicant override
- Audit log of every AI suggestion + user action (per profile, exportable)

### Launch
- Email the photo-checker list (200+ by now): "We built the rest"
- Limited launch discount: $19 / $49 for first 100
- Post launch in original Reddit/Xiaohongshu threads as updates

### Exit criteria (end of week 10)
- ≥20 paid users
- Conversion from photo-checker email → paid: ≥3%
- Refund requests: <10%

### Go/no-go
- **<5 paid users** → pricing or value-prop is wrong. Talk to 10 free users to find out why before building more
- **≥20 paid users** → continue to interview prep

---

## Phase 6 — Voice Interview Prep + Iteration (Weeks 11–12)

**Goal:** ship the highest-emotional-payoff feature; iterate on what the first 20+ users complain about.

### Build
- OpenAI Realtime API integration
- Question bank: 50 questions, tagged by visa type (F1/B1/H1B) and consulate-specific patterns
- Voice mock: AI plays consular officer, asks 5 questions, gives feedback on:
  - Answer length (too long? too short?)
  - Hesitation/uncertainty markers
  - Common red flags ("immigration intent" wording, contradictions vs. their DS-160 data)
- **Cap voice usage**: 3 sessions on Single tier, 10 on Family, unlimited on Premium (cost control)

### Exit criteria (end of week 12)
- ≥100 total paid users (cumulative, including week 10's 20)
- ≥5 organic referrals (family/friend signups attributed to a paid user)
- ≥3 unsolicited testimonials
- LLM cost per paying user <$2

---

## What's deferred past MVP (and why)

| Deferred | Why | When |
|---|---|---|
| Chrome extension | Maintenance burden + Web Store risk; PDF cheat sheet validates the value first | Month 4–5, after 100 paid users say "I want this" |
| Outcome tracking (approved/RFE/denied) | Needs ~500 users for any signal; opt-in flow needs careful legal review | Month 6+ |
| Hindi UI | Validate CN works first; Hindi adds another translation maintenance burden | Month 4 |
| Native mobile | Web on mobile is fine; native is 3x the eng cost | Year 2 if at all |
| DS-260, I-130, I-485 | Different forms, different liability, different competitors (Boundless owns I-130/I-485) | Year 2, separate product line |
| Appointment monitoring | Anti-bot territory + ToS hostile + low monetization | Probably never |
| White-label / agency tier | Premature without a proven consumer product | Year 2 |

---

## Critical path callouts

1. **Vision LLM accuracy is the biggest single technical risk.** If passport extraction doesn't hit 90% by week 4, the conversational intake UX has to change (every field becomes "type it in" instead of "confirm what we found"). Eval continuously.

2. **Distribution proves itself or doesn't in week 1–2.** Don't build for 8 more weeks if the photo checker can't pull traffic. The whole GTM thesis depends on cheap viral acquisition.

3. **Attorney consultation is week 0, not week 12.** Disclaimer wording shapes every UI surface. Don't ship the photo checker without it.

4. **DS-160 itself changes occasionally.** The 30-field schema needs an owner who watches for State Dept updates. Schedule a quarterly review.

5. **WeChat OAuth is a pain.** Budget 2–3 days of week 3 for it; it's a known footgun. Worst case, ship without it and add later.

---

## Skills / hires needed

- **1 full-stack TS engineer** (you, presumably) — owns the build
- **1 prompt engineering / eval contractor** (10–20 hours total) — sets up Vision LLM evals properly
- **Immigration attorney** (3–5 hours total over 12 weeks) — disclaimer review, UPL exposure check, "is this risk-flag wording safe" review
- **Native Mandarin reviewer** (5–10 hours) — UI translation quality, intake question wording, content for Xiaohongshu
- **Designer** — skip for MVP; use shadcn/ui. Hire after $5K MRR

Total external spend through week 12, beyond LLM/infra: ~$2–4K (attorney + contractors + Xiaohongshu/YouTube creator collabs).

---

## Weekly cadence

- **Monday**: review last week's PostHog funnel + LLM cost report; pick week's exit criteria
- **Wednesday**: run Vision LLM evals against test set; check for regressions from prompt changes
- **Friday**: 1 user interview (recruited from email list, $20 incentive); write up findings
- **Daily**: Sentry triage, support email triage

---

## Open decisions to make in week 0

1. **Chat-first vs. guided-form-first intake?** Recommendation: guided form. (Decided in §Phase 3 above, but worth a final 30-min think before week 5.)
2. **Single domain or split?** `formcopilot.app/photo` shares brand with the paid product, but free-tool users may get confused. Could split as `photocheck.formcopilot.app`. Lean toward unified.
3. **WeChat login at launch or just Google + email?** Lean toward email-only at launch (simpler), add WeChat in week 6.
4. **Where do we host data for Chinese users?** Open question from design.md. Defer until first 50 paid users; if >30% are in mainland China, revisit. *(Most F1 students apply from China but with a US-bound destination — data residency story matters but isn't blocking at <100 users.)*
5. **Refund policy?** Recommendation: 7-day no-questions refund. Trust > fraud risk at this scale.
