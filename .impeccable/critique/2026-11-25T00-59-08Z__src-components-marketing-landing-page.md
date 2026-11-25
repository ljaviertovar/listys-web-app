---
target: landing page
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 4
timestamp: 2026-11-25T00-59-08Z
slug: src-components-marketing-landing-page
---
# Critique: landing page (/) — 2026-11-24
Method: dual-agent. Score 20/32 (H7, H10 n/a) — Acceptable.

Specificity: hero authored (receipt pile, scan seam, phone list). Below hero generic SaaS: photo zigzag with AI-style images and fake UI, 3x2 equal card grid (refused by contract), stock banner + eyebrow, dark photo CTA band. Claims repeated (clone x4, check-lands x3).

Priority issues:
- [P1] Copy contradicts product truth: faq-section.tsx:15 "you decide whether the trip's changes go back"; how-it-works:63 "Sync the trip back"; PRODUCT.md says completing always saves. Auth: get-started says Google or email; PRODUCT.md says Google only (code supports email) — reconcile.
- [P1] Below-hero proof is generated lifestyle photos with non-Listys UI (step-01..03.webp, shared banner, close-bg.jpg). Replace with product-state compositions from Row/Pill kit.
- [P1] Features 3x2 equal grid (features-section.tsx:193) = refused pattern, duplicates other sections, ~2,450px mobile. Replace with "A list that remembers" Trip 1 vs Trip 5 demo.
- [P1] Differentiator (memory/reorder/avg price) never shown, only bulleted.
- [P2] landing.ts constants unused; copy hard-coded; dead copy holds banned phrases.
- [P2] Shared lists: two near-identical device cards, eyebrow kicker, inconsistent initials.
- [P2] Final CTA dark photo band off-world, third-party branding.
- [P2] Targets: CTAs 40px, nav/footer links 20px, X link 6x16; mobile height 9.4k px, no reachable CTA mid-page.
- [P3] Footer h4 skips h3; 8-10px text in mockups (19 detector hits); hero 390px receipt clipped; "3 of 12 checked" vs 1 visible; eyebrow pill with spark in hero.
Detector false positives: gray-on-color (selection color), low-contrast shared h2 (photo scrim), nested-cards & text-occlusion in mockups, cramped-padding FAQ.
