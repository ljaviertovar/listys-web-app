---
version: 1
slug: "src-components-marketing-landing-page"
primary_target: "src/components/marketing/landing-page"
related_targets: ["src/app/(marketing)/page.tsx"]
---

Scope: the public marketing landing page at `/` — hero, how-it-works, shared lists, FAQ, final CTA. Visitor mode: Persuade.

Audience: a household shopper who already owns the problem — a drawer or pocket full of paper receipts and a list they retype every week. Job on this page: understand in one viewport that a photographed receipt becomes an editable, reusable list, and create a free account. Single action: `Create free account` (Google sign-in). No pricing, no second CTA, no demo gate.

Proof allowed: the product UI itself. Forbidden and removed: `1k+ users`, `5k+ receipts processed`, `4.9/5 App Store rating`, `10+ shared groups`. The 99% figure ships only as a commitment next to the review step, never as a measured statistic.

Copy is English, held in `src/data/constants/landing.ts` so a Spanish switch needs no layout work.

## Direction contract

THESIS: Many pieces of paper become one living list. The page argues by subtraction — it opens on the visitor's actual mess, resolves it once, and never repeats the claim. It refuses the category default this page previously shipped: a centred gradient headline over a phone orbited by floating capability badges, followed by a grid of equal icon-heading-text cards.

OWN-WORLD: DESIGN.md's paper, ink and scan beam, unchanged. Canvas `#F8FAFC` washing to `#F4F8FF`, paper `#FFFFFF` for every working surface, ink `#0F172A`, action blue `#2563EB` for the single CTA and selection, scan cyan `#38BDF8` only on the one seam that crosses the pile, collaboration violet `#7C3AED` only where people appear. Plus Jakarta Sans for voice, IBM Plex Mono for merchant metadata, amounts, timestamps and counts. Receipt slips carry a notched bottom edge; ordinary cards never do. Hairline borders before shadows; no mesh gradient, no gradient text, no eyebrow labels.

STORY: The visitor sees their own drawer of receipts, watches one of them resolve into an organised list inside a phone, understands that they review every line before it saves, sees the list absorb more receipts and keep what the household buys, sees three people shopping one live list, and creates an account.

FIRST VIEWPORT: Left half, ink headline `A drawer full of receipts. One list that remembers.` at display scale, one paragraph, the primary action, and a mono line naming what was just read. Right half, an iPhone frame holding the extracted list — categories, quantity chips, progress header. Between and behind them, a scatter of six receipt slips at shallow rotations; the largest, a twelve-line MARKET FRESH receipt, sits under a single cyan seam and is the one whose items fill the phone. The seam runs once and stops.

FORM: The pile, dealt as candidate 7 of seven ranked structures; seed key `0d098123`, surface scope, Persuade mode. The user locked it and amended it: keep the iPhone frame, and give the receipts more lines with one long receipt as the scanned source.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
