# Form Copilot — DS-160 AI Preparation Assistant

## 0. What changed vs. the original draft

The original brief had the right instincts. Below are the deltas in this version:

| Area | Original | Updated |
|---|---|---|
| Positioning | "AI visa preparation copilot" | Same — kept verbatim. It's correct. |
| Wedge | Vague: "students" | Sharpened to **3 wedge features** (photo compliance, family workspace, session recovery) inside the student segment |
| Competition | Not addressed | New section with concrete competitors and where each is weak |
| Interview prep | "premium add-on" | Promoted to **core surface** — voice AI mock interview is the highest-emotional-payoff feature |
| Photo problem | Not mentioned | Treated as a standalone product wedge — DS-160 photos are rejected often and there's no good consumer tool |
| Appointment booking | Not mentioned | Acknowledged as a separate (painful) workflow, scoped *out* of MVP but in product roadmap |
| DS-160 vs DS-260 | Conflated | Scoped: **DS-160 only** for v1. DS-260 is a different system, different liability profile |
| Browser automation | "Chrome extension or Playwright" | Cut Playwright. Extension only — Playwright on the user's machine is a support nightmare and a Chrome Web Store violation magnet |
| Privacy | Not addressed | New section. Passport + SEVIS handling needs a real story before any user trusts you |
| Legal framing | "be careful" | Concrete disclaimer/UX patterns + a "no predictions of approval" rule baked into the product |
| Pricing | Single table, no validation | Restructured around willingness-to-pay evidence (what students currently pay agents) + a validation plan |
| Family / cohort | Not mentioned | One household = 3–5 DS-160s with overlapping data. Major UX moat |
| Distribution | "Reddit, WeChat" | Expanded with specific channels (Xiaohongshu, OISS partnerships, employer immigration benefit programs) |
| Moat | "Immigration knowledge graph" | Kept, but added the more defensible piece: **anonymized refusal/RFE outcome data** from users who opt in |

---

## 1. Thesis (one paragraph)

The DS-160 is a 150-field government form with a 1990s UI, 20-minute session timeouts, English-only field labels, and consequences ranging from a $185 wasted fee to a denied trip. Millions of people fill it every year, mostly with help from someone — an agent, a relative, a YouTuber, a lawyer. AI can replace 80% of what those helpers do for a fraction of the price, *if* the product is positioned as a **preparation copilot** (intake, validation, document organization, interview prep) rather than a **submission bot** (which is technically fragile and legally exposed).

---

## 2. Problem

### The DS-160 itself
- ~150 fields across 11 sections
- Session times out at ~20 min idle; lost work is common
- Application ID + security question — if lost, restart from scratch
- Bilingual labels exist (varies by consulate) but help text is English-only
- Photo upload at the start: 600×600, white background, head proportions — **rejected often**, restart required
- After submit: confirmation page (with barcode) **must** be printed and brought to interview

### What people actually struggle with
1. **Translation/wording** — "Have you ever been refused a visa?" surfaces edge cases (a denied ESTA? a withdrawn application?) that need interpretation
2. **Consistency** — names on passport vs. SEVIS vs. resume; employment dates that contradict travel history; addresses formatted differently across documents
3. **Photo rejection** — silent failure mode; users don't know until interview
4. **Anxiety** — "will this question hurt my approval?" with no good source
5. **Repeating work for family** — spouse + 2 kids = 3 forms with the same address, employer, travel history
6. **Interview prep** — most people walk in cold or rely on outdated YouTube videos

The DS-160 is the *visible* pain. The full job is **"prepare me for my visa interview without paying a lawyer or a sketchy agent."**

---

## 3. Market

### Volume
- ~10M+ non-immigrant visa applications per year (US State Dept., recent years)
- Concentrated origin countries: India, China, Mexico, Brazil, Vietnam, Philippines, Nigeria, Colombia
- Fee per application: **$185 MRV fee** (just for filing, non-refundable)

### Customer segments (by willingness to pay)

| Segment | Pain | Current spend on help | Best fit for v1? |
|---|---|---|---|
| F1 students (first-time) | Very high | $200–500 to agents (esp. China/India) | ✅ Primary wedge |
| H1B stamping renewals | Medium-high | $0–$300 (often DIY but anxious) | ✅ Secondary |
| Tourist (B1/B2) parents visiting kids | High | $50–200 to agents/relatives | ⚠️ Hard to reach directly |
| L1 / J1 / company-sponsored | Low (employer's lawyer pays) | N/A | ❌ Skip |
| Immigration agencies / consultancies | Operational | $tooling | 🔮 B2B v2 |
| University OISS offices | Reputation | $0 (would refer) | 🔮 Channel partner, not customer |

### Why the China + India F1 wedge specifically
- Highest absolute volume
- Highest baseline spend on help
- Concentrated communities (Xiaohongshu, WeChat, Reddit r/f1visa, university Discords) → cheap distribution
- Time-pressured (visa interview slots scarce → urgent purchase)

---

## 4. Competitive landscape

| Tool | What it does | Where it's weak |
|---|---|---|
| **Immigration lawyers** | Full service, $500–2000+ | Cost, slow turnaround, overkill for B/F visas |
| **Visa agencies (e.g., VisaHQ, iVisa)** | Form-filling service, ~$80–150 | Manual back-office, slow, generic, weak on edge cases |
| **Boundless / SimpleCitizen** | Marriage/green card forms (I-130, I-485) | Don't really cover DS-160 well; immigrant-visa focused |
| **Chinese WeChat agents (签之家, 三毛游, etc.)** | Manual filling + interview prep, $100–400 | Quality varies wildly; trust issues; slow |
| **YouTube tutorials / Reddit threads** | Free | Out of date; no personalization; no validation |
| **Path2USA, Stilt, etc.** | Static guides + checklists | No interactivity, no validation, no intake |
| **CEAC official site** | The actual form | Hostile UX; no help; the problem we're solving |

**The gap:** an interactive, validated, bilingual, document-aware copilot priced between "free static guide" and "$300 agent." Nobody is in this slot for DS-160 specifically.

---

## 5. Product strategy

### Three wedge features (MVP)

These are the pieces that get people to pay $19–49 *without* needing the full vision:

**Wedge 1 — Photo compliance, instant**
- Upload phone photo → AI checks dimensions, background, head proportions, lighting, expression
- Output: pass/fail with specific fixes ("crop tighter, head should be 50–69% of frame height")
- Optional: AI background-replacement to white, with explicit "you must take a real photo, this is for preview" disclaimer
- **Why it works:** standalone value, viral ("save $20 at the photo store"), low legal exposure

**Wedge 2 — Family workspace**
- One account → multiple applicants
- Shared fields auto-fill across forms (home address, employer, travel history)
- Per-applicant override for differences (different employment for spouse, no employment for kids)
- **Why it works:** the only product in market that treats "we're applying together" as a first-class concept

**Wedge 3 — Session recovery / draft sync**
- All answers stored on our side as a structured profile
- Even if CEAC times out, the user's answers are safe
- Resume in CEAC by re-pasting from our UI
- **Why it works:** addresses the most-cited pain in every Reddit/Xiaohongshu post about the form

### Core flow

```
1. Document intake     → upload passport, I-20/DS-2019, prior visa, resume
                         → AI extracts structured profile (Vision LLM)
                         → user confirms each extracted field (audit trail)

2. Conversational      → AI asks plain-language questions, not DS-160 jargon
   intake              → maps answers to DS-160 field IDs internally
                         → bilingual: question in CN/HI, examples localized

3. Consistency check   → cross-validates passport ↔ SEVIS ↔ resume ↔ travel
                         → flags mismatches with specific fix suggestions

4. Form preparation    → generates a "ready to enter" profile
                         → exports as printable cheat-sheet (PDF)
                         → Chrome extension auto-fills CEAC fields with
                           human in the loop (one section at a time, user
                           clicks "next" between sections)

5. Interview prep      → voice AI mock interview, consulate-specific
   (core, not add-on)    questions, tone feedback, common 221(g) triggers
```

### Explicitly NOT in MVP
- Appointment scheduling (`ustraveldocs.com`) — separate beast, anti-bot, and probably ToS-hostile
- DS-260 (immigrant visa) — different system, different liability
- I-130/I-485/USCIS forms — different product, different competitors (Boundless owns this)
- Auto-submit DS-160 without human click — too fragile, too risky
- Predicting approval probability — legal landmine, see §8

---

## 6. Architecture

### Client
- **Web app** for intake, document upload, profile review, interview prep
- **Chrome extension** for assisted fill on `ceac.state.gov`
  - Reads current section, suggests value from user's profile
  - User clicks to accept each field (audit trail)
  - Never auto-clicks "Next" or "Submit"

### Backend
- **Profile service** — normalized JSON of applicant data (passport, history, employment, etc.) versioned per family member
- **LLM layer** — vision (passport OCR) + text (intake, validation, interview Q&A) + voice (interview practice)
  - Vendor-flexible: route by task to lowest viable model
- **Validation engine** — deterministic rules (dates, country codes, SEVIS format) layered with LLM checks for fuzzy issues (employer name variants)
- **Knowledge layer** — DS-160 field schema, consulate-specific quirks, common refusal patterns (curated, not LLM-hallucinated)

### Privacy (table stakes — see §8)
- All passport scans, SEVIS, etc. encrypted at rest
- User-deletable profile (one-click purge)
- No training on user data without explicit opt-in
- Region-specific data residency (esp. for China users — needs thought)
- SOC 2 trajectory from day one

---

## 7. Moat

The original draft said "immigration knowledge graph." Correct, but soft.

Stronger moat layers:

1. **Curated DS-160 field schema + edge case library**
   - Every weird field interaction we discover gets codified
   - This is *labor*, not *intelligence* — competitors can copy the AI but not the years of edge cases

2. **Anonymized outcome data (opt-in)**
   - Users who tell us "approved / 221(g) / denied" feed a private dataset
   - Over time this enables consulate-specific recommendations no competitor can match
   - Critical: never expose to user as "approval probability" — only as "users with similar profiles flagged X"

3. **Family / cohort lock-in**
   - Once a family's profile is in our system, the next renewal/sibling/visit is trivial
   - Renewal cycle is 5–10 years (long), but families have multiple visas per year on average

4. **Distribution moat** — university OISS partnerships, immigration agency white-label
   - Slower to build, but defensible once established

---

## 8. Legal & trust framework (mandatory, not optional)

### Hard product rules
- ❌ Never predict approval/denial probability to the user
- ❌ Never present AI output as "legal advice"
- ❌ Never auto-submit anything to a government system
- ✅ Every AI suggestion shows source + confidence
- ✅ Every extracted field requires user confirmation (audit trail)
- ✅ Disclaimer surface: footer + first-run + before any "risk flag"

### Disclaimer pattern (test the wording with a US immigration attorney before launch)
> "Form Copilot is a preparation tool, not a law firm. We help you organize and review information for your DS-160. Final responsibility for accuracy and submission rests with you. For legal advice about your specific case, consult a licensed immigration attorney."

### "Risk flag" framing
Instead of "you have a 30% chance of denial":
> "Profiles with an unexplained gap in employment history sometimes face follow-up questions at interview. Consider preparing an explanation."

Factual, prep-oriented, no prediction.

### Regulatory exposure
- US: UPL (unauthorized practice of law) — varies by state, has been used against form-prep tools historically. Mitigate with disclaimers + no individualized legal advice + no representation
- China: data export rules for personal info (PIPL) — passport data is sensitive personal info; need a real plan
- EU: GDPR — relevant if any EU applicants
- Anti-bot/ToS: Chrome extension assisting fill is in a grey area but defensible (user-initiated, no automation of consequential actions)

---

## 9. Go-to-market

### Phase 1: F1 students from China + India (months 0–6)

**Channels**
- Xiaohongshu (RED) — visa anxiety content, before/after photo compliance, family workspace demo
- Reddit r/f1visa, r/USCIS, r/h1b — be helpful first, product second
- WeChat groups for new admits at top US universities (CMU, Columbia, USC, NYU, etc.)
- YouTube collaborations with existing visa/study-abroad channels

**Hook content**
- "Your DS-160 photo will probably be rejected — here's why" (free photo checker as lead magnet)
- "We filled out 10 DS-160s in one evening for a family of 4" (family workspace demo)
- Bilingual interview prep videos

### Phase 2: H1B stamping (months 6–12)
- Reddit r/h1b, r/USCIS
- Indian/Chinese tech employee communities
- Slack/Discord communities for tech immigrants
- Renewal-focused: "your last DS-160 + 3 years of changes"

### Phase 3: B2B (year 2+)
- White-label for immigration agencies
- University OISS partnerships (free tier for enrolled students)
- Employer immigration benefit programs (Deel, Remote, etc. partnership)

---

## 10. Pricing

### Validated reference points
- Chinese DS-160 agents: $100–400 depending on complexity
- Indian visa consultants: ₹2,000–8,000 ($25–100)
- US visa agencies (VisaHQ etc.): $80–150
- Immigration lawyer (full-service): $500–2,000+
- Visa photo at CVS: $15–20

### Proposed pricing (to validate)

| Tier | Price | What's included |
|---|---|---|
| **Free** | $0 | Photo checker, basic field guide, 1 form draft (no validation, no extension) |
| **Single applicant** | $29 | Full intake, validation, extension, interview prep (5 sessions) |
| **Family pack** | $79 | Up to 5 applicants, shared profile, all of above |
| **Premium** | $129 | Adds priority support, unlimited interview prep, document vault for renewals |
| **Agency** | Custom | White-label, multi-tenant, audit logs |

**Validation plan**
- Land first 100 paid users at $29 manually (concierge MVP — humans behind the AI initially)
- Measure: conversion from free photo checker → paid; refund rate; NPS
- Adjust pricing based on actual willingness-to-pay, not guesses

---

## 11. Risks (expanded)

### Product
- **AI hallucination on legal-adjacent fields** — mitigate with deterministic validators, human confirmation on every field, conservative LLM prompts
- **Photo "pass" by us, "fail" at consulate** — must underweight the AI's confidence; explicit disclaimers
- **CEAC site changes** — Chrome extension breaks; need monitoring + fast fix cadence

### Business
- **CAC too high** — distribution-dependent; if we can't get viral loops working in F1 student communities, unit economics break
- **One-shot purchase** — low LTV; family + renewal flows are the path to repeat revenue
- **Trust** — sketchy-agent space; need real privacy story + maybe an attorney advisor on board

### Legal
- **UPL claims** — biggest existential risk; needs counsel review before launch
- **Data breach** — passport + SEVIS leaks would be catastrophic; security is product
- **PIPL / GDPR exposure** — handling Chinese/EU users with US-hosted data needs an answer

### Competitive
- **Boundless or VisaHQ adds AI** — they have distribution; we'd need to be meaningfully better, not just AI-flavored
- **OpenAI / Anthropic releases a better generic agent** — defensible only if our knowledge layer + outcome data are real

---

## 12. MVP scope (3 months)

### Must have
- [ ] Photo compliance checker (web, free, lead magnet)
- [ ] Document upload + Vision LLM extraction (passport, I-20)
- [ ] Conversational intake → profile JSON for the 30 most-error-prone DS-160 fields
- [ ] Consistency validation (passport ↔ SEVIS ↔ entered data)
- [ ] Bilingual UI (English + Simplified Chinese) — Hindi in v1.1
- [ ] Printable cheat-sheet PDF (no extension yet — proves value first)
- [ ] Disclaimer surfaces, confirmation per field, audit log

### Should have
- [ ] Family workspace (2nd applicant minimum)
- [ ] Voice interview prep (English + CN), 5 questions deep
- [ ] Stripe checkout, $29 single / $79 family

### Defer
- [ ] Chrome extension (ship after first 100 paid users validate intake quality)
- [ ] Outcome tracking / refusal data collection
- [ ] DS-260, I-130, etc.
- [ ] Appointment monitoring

### Success criteria for "did MVP work?"
- 100 paid users
- Conversion from free photo checker → paid ≥ 3%
- Refund rate < 10%
- ≥ 5 organic referrals (family/friend signups attributed to a paid user)
- ≥ 1 unsolicited "this saved me" testimonial per week by month 3

---

## 13. Open questions

1. **Where do we host data for Chinese users?** PIPL is a real constraint. Options: (a) accept the risk, (b) China-hosted instance with separate stack, (c) restrict to overseas Chinese users only at launch
2. **Do we need an attorney as cofounder/advisor?** Almost certainly yes for trust + UPL defense
3. **Chrome extension or copy-paste?** Extension is better UX but adds maintenance burden + Web Store risk
4. **Free tier — photo only, or include intake?** Photo-only protects margins; full intake might drive better viral loops
5. **Voice interview prep — how realistic?** GPT-4o-style voice is good enough for MVP, but consulate-specific tone is hard to nail
6. **Refund policy?** Strong refund posture builds trust; bad-actor risk is real for one-shot purchases

---

## 14. What was wrong / soft in the original draft

For the record:

- **"Pure browser automation will break constantly" → DO NOT build "Fully autonomous AI fills DS-160 directly."**
  Correct conclusion, but the reasoning ("automation breaks") understates the *legal* reason it's a bad idea. Submitting to a government system on someone's behalf is materially different from filling an Amazon checkout.

- **"refusal prediction" listed as a future feature**
  Should be explicitly off the roadmap. Predicting government decisions is exactly the kind of feature that gets you sued or shut down.

- **"interview coaching" / "appointment prep" / "renewal workflows" / "embassy-specific optimization" as moat**
  These are *features*, not the moat. The moat is the curated knowledge layer + opt-in outcome data that powers them.

- **Pricing table presented without validation**
  Original prices ($19–149) are plausible but unsupported. Real validation requires shipping and measuring, not a table.

- **"Chinese students / Indian students / Reddit / WeChat" as the channel plan**
  Too thin. Each channel needs a content angle and a hook. Xiaohongshu video ≠ Reddit text post ≠ WeChat group share — different formats, different funnels.

- **"GPT-4/5-level models are dramatically better at extraction"**
  True but generic. The relevant tech enabler is **Vision LLMs** for passport/I-20 OCR (no longer needing AWS Textract or Google Doc AI), and **realtime voice models** for interview prep — both are recent and material.

- **No mention of the photo problem**
  Probably the single most underserved pain point in the DS-160 space, and a great viral wedge.

- **No mention of family workflows**
  Big miss — this is one of the few real differentiators available.
