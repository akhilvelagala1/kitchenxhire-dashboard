# Public homepage (`/` and `/home`)

`src/modules/home` reproduces `kitchenxHire-prototype/index.html`. The prototype is the source of truth. This page renders outside `AppShell` through `publicRoutes`, and the module owns its header, footer, job dialog and login sheet. Rules: UI-12 and UI-13 in `.claude/skills/ui-standards/SKILL.md`.

## Where things live

| Prototype                      | React (`src/modules/home`)                                               |
| ------------------------------ | ------------------------------------------------------------------------ |
| Header, mobile menu, city menu | `SiteHeader`, `MobileMenu`, `LocationPicker`                             |
| Hero, search                   | `HeroSection`, `JobSearchBar`                                            |
| Feature panel                  | `FeatureBand`                                                            |
| Roles                          | `RolesSection`, `RoleCard`                                               |
| Businesses                     | `BusinessesSection`                                                      |
| How it works                   | `HowItWorks`                                                             |
| Jobs and details dialog        | `RecentJobs`, `JobCard`, `JobDialog`                                     |
| Match, stories, closing CTA    | `MatchSection`, `StoriesCarousel`, `FinalCta`                            |
| Footer                         | `SiteFooter`                                                             |
| Login and OTP overlay          | `AuthDialog`, `AuthSheet`                                                |
| Post-OTP profile onboarding    | `JobSeekerOnboardingOverlay` on `/user` (form → success, blurred portal) |
| Static data (all local)        | `content/`; a later API replaces it and the components stay              |
| Shared page state              | `layout/HomeStateProvider` (role, city, chosen location, flow tab)       |

## Deviations from the prototype

- **Header**: frosted (`white/95` with a backdrop blur) exactly as in the prototype. UI-01 bans blur elsewhere, so UI-13 names this one exception.
- **Role, meta and menu icons**: Lucide equivalents (UI-12). The prototype hand-draws these. The four feature icons are already Lucide paths and are identical.
- **Social icons**: three inline SVG (Lucide dropped brand logos). Links go to `#top`, as in the prototype, until real URLs exist.
- **Login sheet**: a native `<dialog>` (focus trap, Escape, scrim) instead of a fixed `div`. The prototype writes the verified number to `sessionStorage` but never reads it, so that write is omitted. Any six digits proceed, and nothing is sent anywhere.
- **Hero image**: the homepage and the recruiter homepage (`/recruiter`) both use `hire-hero-home.webp` (master kitchen-team banner 2172×724 → webp under 400 KB, baked-in left text area). Other public surfaces still use `hire-hero.webp`.
- **Hero layout**: inset rounded card (~380px tablet / ~420px desktop) with the photo behind the text from 768px, matching the Nov 2026 homepage blueprint. On phones the text stays above the photo so faces are not covered. No extra CSS wash — the banner’s left fade carries the headline. Both homepages render the card through `HeroBannerShell`, so the geometry, radius, crop and entrance animation cannot drift apart; only the copy and actions differ.
- **Fonts**: Inter Tight (headings, buttons) and Source Sans 3 (`p`, `label`, `input`, `select`, `li`, `td`, `th`), self-hosted from `@fontsource-variable`. The prototype loads them from Google Fonts, which the nginx CSP blocks.
- **Hamburger button**: 40px, as in the prototype. UI-07 asks for 44px tap targets, and this button falls short of that on purpose.
- **Keyboard and focus**: the skip link shows on focus, and the how-it-works tabs also move with the arrow keys. The visuals are unchanged.
- **Hero `<h1>` and two native selects** carry a `guard-allow` comment, because the page contract guard bans them in modules.
- **Reduced motion**: the carousel's side-card scale is dropped, as in the prototype's own reduced-motion rule.

## Checking the match

Geometry and pixels were compared against the prototype with the same Chrome at 375, 768, 1024, 1280 and 1920px, with autoplay frozen and reduced motion on. The harness lives outside the repo.
