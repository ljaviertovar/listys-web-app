---
target: dashboard mobile
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-10-07T03-47-13Z
slug: src-app-authenticated-dashboard-page-tsx
---
Method: dual-agent (A: a71b34d62cf635dc3, B: ad293bc865bb7ee8e). Target: dashboard mobile (390x844), sample-data preview.

Note: the dev server served a stale stylesheet (--primary rendered #3B82F6 instead of the specified #2563EB), so colour/contrast measurements are against the old blue. Restart the dev server and re-measure.

## Design Health Score: 25/40 (Acceptable)
1 Visibility of status 3 | 2 Match real world 3 | 3 User control 2 | 4 Consistency 2 | 5 Error prevention 3 | 6 Recognition 3 | 7 Flexibility 2 | 8 Minimalist 2 | 9 Error recovery 2 | 10 Help 3

## Design specificity
Product logic is authored for Listys (clone-from-base-list copy, quick start with store and count, data-derived Up next, mono only for receipt metadata). The visual skin is category-interchangeable (dark photo hero, greeting + date pill, three identical cards); the memory signature is invisible. Detector: CLI 0 findings; overlay 6 (low-contrast on blue CTAs measured on the stale blue, thin-border-wide-shadow on cards by design, cramped-padding on a chip = false positive, overused-font and layout-transition = noise).

## Priority issues
P1 Duplicated primary actions (hero CTA + fixed bar at scroll 0; three Upload Receipt on an empty account) and the fixed bar covers focused elements (View all links, history rows, stale-list Up next card). Fix: show the bar only after the hero CTA leaves the viewport, scroll-padding-bottom on main, one Upload. Commands: distill, harden.
P1 The in-store start path ends on the smallest, most ambiguous controls (32px Quick start chips open the editor, hero CTA goes to the list index, real start is a 129x32 button). Commands: adapt, clarify.
P2 288px preamble before the hero; amber used for the decorative date and for the warning "receipt waiting". Command: distill.
P2 Accessibility: card titles are div not headings, pinch zoom disabled (maximum-scale=1, user-scalable=no), drawer close button 32px and credit link 17px, drawer width 292 vs 312, contrast to re-measure after restart. Commands: harden, audit.
P2 Long monotone scroll (about 2.9 screens of identical cards) and a wall of three empty cards for a brand-new account. Commands: layout, onboard.
P3 No Listys signature in the skin. Command: bolder.

## Persona red flags
Casey: menu top-left, 32px start buttons 56px apart next to a 41px link, 32px chips with 12px muted suffix; hero CTA is good. Jordan: three Upload Receipt with different styles, "group" means store, three 0 cards invite tapping into empty screens. Sam: bar covers focused links, cards have no headings, no pinch zoom; focus ring and names are good.

## Minor observations
Orphan "· $86.40" in the last-session line; en-GB date next to $ amounts; Completed badge at exactly 4.50:1; avatar initials 3.1-3.9:1 where they overlap; two row pairs 4px apart; scroll-behavior smooth under reduced motion.

## Questions
Why does the first-viewport action sit behind a date pill, greeting and upload button, and why does a second bar repeat it? Why show tallies instead of what the household buys most? Would a single ordered list serve the thumb better than four containers?
