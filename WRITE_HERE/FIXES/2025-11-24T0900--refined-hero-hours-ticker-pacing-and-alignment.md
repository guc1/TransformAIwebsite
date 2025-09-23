# Refined hero hours ticker pacing and alignment

- **What:** Centered the hero ticker between the CTAs, made the buttons mirror each other, and rebuilt the deterministic growth
  schedule so the counter idles and jumps in varied chunks while compounding from the 23 September 100,000-hour baseline with a
  1.10 daily factor.
- **Why:** The previous layout left the ticker visually off-center and the logic advanced in single increments, creating an
  unconvincing experience despite the requested baseline and growth curve.
- **Files:** `apps/www/components/hero/hero-main-section.tsx`, `apps/www/components/hours-saved-ticker.tsx`.
- **Follow-ups:** None.
