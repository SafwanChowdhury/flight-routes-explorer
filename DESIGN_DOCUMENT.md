# Flight Routes Explorer — Design & Feature Alignment Document

**Goal:** Bring the Flight Routes Explorer web app to feature parity with the SimRoutesApp and align its visual design language with the mobile app.

---

## Table of Contents

1. [Visual Design Differences](#1-visual-design-differences)
2. [Navigation & Layout Differences](#2-navigation--layout-differences)
3. [Missing Features](#3-missing-features)
4. [Component-Level Differences](#4-component-level-differences)
5. [Implementation Roadmap](#5-implementation-roadmap)

---

## 1. Visual Design Differences

### 1.1 Color Palette

The mobile app uses a richer, dual-mode color system with a distinct **brand yellow** accent in dark mode.

| Token | Web App (current) | Mobile App | Recommended Web Value |
|-------|-------------------|------------|-----------------------|
| Primary (light) | `blue-700` (#1d4ed8) | `rgb(77, 77, 222)` | `#4D4DDE` |
| Primary (dark) | `blue-800` (#1e40af) | `rgb(3, 133, 255)` | `#0385FF` |
| Brand yellow (dark accent) | Not used | `#ffc803` | `#ffc803` |
| Background (light) | `gray-50` (#f9fafb) | `rgb(242, 242, 247)` | `#F2F2F7` |
| Background (dark) | `gray-900` (#111827) | `rgb(0, 0, 0)` / near-black | `#0a0a0a` |
| Card (light) | `white` | `white` | `white` |
| Card (dark) | `gray-800` (#1f2937) | `rgb(21, 21, 24)` | `#151518` |
| Border (light) | `gray-200` | system divider | `#E5E5EA` |
| Header bar | `bg-blue-700` | `bg-primary` light / `bg-black` dark | `bg-[#4D4DDE]` / `dark:bg-black` |
| Active nav / badge | `blue-600` | primary color | `#4D4DDE` |
| Stats badges | `blue-100 text-blue-800` | brand yellow in dark | `dark:bg-[#ffc803]/20 dark:text-[#ffc803]` |

**Action:** Update `tailwind.config.js` to define brand colors as CSS custom properties. Replace `blue-700` header color throughout with the `#4D4DDE` brand color.

### 1.2 Typography

| Aspect | Web App | Mobile App | Delta |
|--------|---------|------------|-------|
| Font family | Inter (Google Fonts) | Inter (expo-font) | Same font — no change needed |
| Font weights | Not explicitly set beyond Tailwind defaults | 400, 500, 600, 700 explicitly loaded | Ensure all four weights are used |
| Heading style | `text-xl font-bold` (varies) | Inter 700 for titles, 600 for section headings | Standardise heading hierarchy |

### 1.3 Dark Mode Accent Shift

The most distinctive visual difference is the **brand yellow (`#ffc803`) used in dark mode** across the mobile app for:
- Header title text
- Stats badges / counts
- Profile stat numbers
- Settings section badges

The web app uses the same blue in both light and dark modes. Adding the yellow dark-mode accent would immediately give the web app the same "feel" as the mobile app.

### 1.4 Header Styling

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Background | Solid `blue-700` always | Blue in light mode, **black** in dark mode |
| Title style | Plain white text, static | Yellow in dark mode (`text-[#ffc803]`) |
| Stats badges | Inline in header row | Separate bar / separate section |
| Scrolling behaviour | Always visible, static | Collapses / hides on scroll (animated) |

### 1.5 Card & List Item Styling

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Route list item | Table row (desktop) / card (mobile) | Card with airline logo, haul type badge |
| Airline logo | Not shown | Shown via `AirlineLogo` component |
| Haul type badge | Not shown | Pill badge: Short / Medium / Long |
| Distance | Shown in table | Shown as secondary text |
| Card corner radius | `rounded-lg` | `rounded-2xl` / `rounded-xl` |
| Card shadow | Minimal (`shadow-sm`) | More pronounced (`shadow-md` equivalent) |

### 1.6 Bottom / Tab Navigation vs Top Navigation

The web app uses a **horizontal top nav bar** with text links. The mobile app uses a **bottom tab bar** with icon-only tabs. For the web, a top nav is appropriate, but it should be styled closer to the mobile tab bar:

- Use icons alongside (or instead of) text labels
- Use the same set of 5 sections: Routes, Destinations, Search, Schedule, Profile
- Match the active-indicator style (underline or filled pill)

### 1.7 Modal & Popup Styling

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Appearance | Centered fixed overlay | Bottom sheet with rounded top corners |
| Dismiss gesture | Click backdrop | Swipe down + click backdrop |
| Handle bar | Not present | Gray pill handle at top of sheet |
| Padding / spacing | `p-6` | More generous padding, larger tap targets |

---

## 2. Navigation & Layout Differences

### 2.1 Section Structure

The mobile app reorganises sections compared to the web app:

| Web Tab | Mobile Tab | Change Needed |
|---------|------------|---------------|
| Routes (`/`) | Search (tab 3) — "Flight Routes" sub-tab | Merge / rename |
| Circular Routes (`/circular-routes`) | Search (tab 3) — "Circular Routes" sub-tab | Move under Search tab as sub-tab |
| Airports (`/airports`) | Destinations (tab 2) — "Airports" sub-tab | Move under Destinations |
| Airlines (`/airlines`) | Airlines (tab 1) | Keep as own tab (rename from "Airlines") |
| Countries (`/countries`) | Destinations (tab 2) — "Countries" sub-tab | Move under Destinations |
| Schedule (`/schedule`, `/schedule/new`) | Schedule (tab 4) | Keep; merge new-schedule form into schedule page |
| *(not present)* | Profile (tab 5) | **New page needed** |

### 2.2 Header Contextual Actions

The mobile app's header changes its action icons based on the current screen. The web app has no contextual actions in the header. Needed actions per section:

| Section | Actions |
|---------|---------|
| Routes / Circular Routes | Filter toggle, Dice (random), Favorites toggle |
| Airports | Filter toggle, Dice (random) |
| Countries | Filter toggle |
| Airlines | Search toggle |
| Schedule | New schedule, Delete schedule, Help |
| Circular Routes | Help link |

### 2.3 Sub-tab Navigation

Two sections need **internal sub-tabs** (pill-style, not full nav-bar tabs):
- **Search tab:** Flight Routes / Circular Routes
- **Destinations tab:** Airports / Countries

These should be rendered as a segmented control / pill toggle near the top of the content area, below the main nav.

---

## 3. Missing Features

### 3.1 Pilot Profile & Flight Logging *(high priority)*

**What it is:** After dispatching a flight via SimBrief, the mobile app prompts the user to "Log this flight." Logged flights accumulate into a Pilot Profile showing:
- Total Flights, Miles Flown, Flight Hours
- Unique airports and countries visited
- Top 5 airlines by flights
- Top 5 aircraft types
- Up to 20 visited airport tags

**Web implementation plan:**
- Add `FlightLog` and `FlightStats` types (mirror `lib/storage.ts` from mobile)
- Store flight logs in `localStorage` under key `flight_logs`
- Show a "Log Flight?" modal/toast after SimBrief button click (same as `FlightLogModal`)
- Add a `/profile` page rendering stats cards matching the mobile Profile tab layout

### 3.2 Favorite Airports & Airlines *(high priority)*

**What it is:** Users can star airports and airlines. Starred items appear in filters and settings.

**Web implementation plan:**
- Store favorites in `localStorage` under `favorite_airports` and `favorite_airlines`
- Add star icon button to each airport row (AirportsList) and airline row (AirlinesList)
- Add "Favorites" filter toggle in RouteFilters to show only routes through favorited airports
- Add Favorites section to a Settings page (view + remove)

### 3.3 Random Route / Dice Button *(medium priority)*

**What it is:** A dice icon in the header triggers random selection — random route, random airport, or random country depending on the active screen.

**Web implementation plan:**
- Add a `Shuffle` icon button in the page header / filter bar for Routes, Airports, Countries
- On click: fetch a random item from the current filtered result set and highlight/open it

### 3.4 Aircraft Management *(medium priority)*

**What it is:** Users maintain a personal list of aircraft (name + ICAO type code) in Settings. This list replaces the static `aircraft.json` dropdown in SimBrief dispatch.

**Web implementation plan:**
- Add a Settings page (`/settings`)
- Aircraft section: list, add, edit, remove aircraft; initialize from `assets/aircraft.json`
- Persist to `localStorage` under key `user_aircraft`
- Use this list in the aircraft picker inside `RouteDetailsPopup` and `ScheduledFlightPopup`

### 3.5 Settings Page *(medium priority)*

**What it is:** A dedicated `/settings` page in the mobile app covers theme, aircraft, favorites, notifications, and data management.

**Web implementation plan:**
- Create `/settings` route
- Sections:
  - **Appearance:** Theme toggle (light / dark / system)
  - **Aircraft:** CRUD for personal aircraft list
  - **Favorites:** View/remove favorite airports and airlines
  - **Data:** Export flight logs as JSON, import, clear logs
- No notifications section needed (browser notifications optional / out of scope initially)

### 3.6 Schedule Agenda View *(medium priority)*

**What it is:** The mobile schedule uses `react-native-calendars` `ExpandableCalendar` + `AgendaList` — a proper month/week calendar with flight cards per day listed below it, showing airline logo, haul badge, times.

The web schedule uses a custom 24-hour pixel-timeline per day with a day navigator. This is functional but visually very different from the mobile app.

**Web implementation plan:**
- Replace or augment the 24-hour timeline with a month calendar view (e.g., `react-big-calendar` or a custom grid)
- Display flight cards per selected day below the calendar (agenda style)
- Flight cards show: airline logo, departure → arrival, times, haul badge
- Keep the 24-hour timeline as an optional "detail" view

### 3.7 Help Pages *(low priority)*

**What it is:** Two dedicated help articles in the mobile app — one explaining schedule generation logic, one explaining circular routes.

**Web implementation plan:**
- Add `/help/schedule` and `/help/circular-routes` pages
- Link from "?" icon buttons in the Schedule and Circular Routes sections
- Markdown-rendered long-form explanation content

### 3.8 Offline Search / Local Cache *(low priority)*

**What it is:** The mobile app preloads all airports, airlines, and countries into AsyncStorage on launch. All search (airport autocomplete, country filter, etc.) queries this local cache with zero network latency.

**Web implementation plan:**
- On first load, fetch and store all airports/airlines/countries in `sessionStorage` or `IndexedDB`
- Route all search autocomplete calls to query this local cache instead of `/api/search`
- TTL: 24 hours (match mobile app)

---

## 4. Component-Level Differences

### 4.1 Airline Logo Component

The mobile app shows airline logos (via `AirlineLogo` component) in:
- Route list items
- Circular route list items
- Schedule agenda flight cards
- Route detail modal header

The web app shows no airline logos anywhere. Adding airline logos would significantly improve visual richness.

**Implementation:** Create a `<AirlineLogo>` component that renders an `<img>` from an airline logo CDN (e.g., `https://content.airhex.com/content/logos/airlines_{IATA}_70_70_s.png`) with a fallback to a plane icon.

### 4.2 Haul Type Badge

The mobile app shows coloured pill badges on every route card and schedule card:
- Short Haul → green
- Medium Haul → yellow/amber
- Long Haul → blue/purple

The web app shows no haul type badge (haul type is only used as a filter in schedule generation).

**Implementation:** Create a `<HaulBadge type="short"|"medium"|"long">` component. Compute haul type from `duration_min` (short < 180, medium < 360, long ≥ 360). Show on route list items and schedule flight cards.

### 4.3 Route Details Modal

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Layout | Centered overlay | Bottom sheet |
| Airline header | Text only | Logo + name |
| Haul badge | Not shown | Shown |
| Distance | Not shown prominently | Shown with icon |
| Aircraft picker | Select dropdown | Native select (same behaviour) |
| SimBrief button | Button with text | Button with SimBrief logo |
| Flight log prompt | Not present | Shown after SimBrief dispatch |
| Favorite toggle | Not present | Star button on departure airport |

### 4.4 Schedule Flight Cards (Agenda)

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Layout | Block on 24h pixel timeline | Horizontal card in agenda list |
| Airline logo | Not shown | Shown |
| Route | Text in timeline block | Departure → Arrival with IATA codes |
| Times | Shown | Shown |
| Haul badge | Not shown | Shown |
| Tap action | Opens `ScheduledFlightPopup` | Opens `RouteDetailsModal` |

### 4.5 Circular Route Details

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| Trigger | Inline popup inside table row | Full `CircularRouteDetailsModal` bottom sheet |
| Aircraft picker | One shared picker above segments | One shared picker at top of modal |
| Segment rows | Flight code + airport pair + duration | Same, plus SimBrief button per leg |
| Total route stats | Not shown | Shown (total distance, total duration) |

---

## 5. Implementation Roadmap

Ordered by impact and effort. Each item is independently deliverable.

### Phase 1 — Visual Alignment (no new features)

1. **Update brand colors** in `tailwind.config.js`:
   - Replace `blue-700` primary with `#4D4DDE`
   - Add `brand-yellow: #ffc803`
   - Darken dark-mode card background to `#151518`
   - Darken body background in dark mode to near-black

2. **Header dark mode** — change header background to black in dark mode; change title text to brand yellow in dark mode

3. **Stats badges dark mode** — use yellow accent (`bg-[#ffc803]/20 text-[#ffc803]`) for stats badges in dark mode

4. **Card styling** — increase border-radius to `rounded-2xl`, add slightly more shadow

5. **Airline Logo component** — add to route list items, modal header, schedule cards

6. **Haul Type Badge component** — add to route list items and schedule flight cards

7. **Bottom-sheet style modals** — update `RouteDetailsPopup` and `CircularRouteDetailsPopup` to render as bottom sheets (slide up from bottom) instead of centered overlays; add pill handle, swipe-close animation

### Phase 2 — Navigation Restructure

8. **Reorganise nav** — restructure to 5 sections matching mobile:
   - Airlines (existing)
   - Destinations → sub-tabs: Airports / Countries
   - Search → sub-tabs: Flight Routes / Circular Routes
   - Schedule (existing)
   - Profile (new)

9. **Add contextual header icons** — filter, dice, favorites, help per section

10. **Sub-tab components** — segmented control pill for Search and Destinations

### Phase 3 — New Features

11. **Favorites** — star buttons on airports/airlines; favorites filter; localStorage persistence

12. **Flight Logging + Profile page** — `FlightLogModal` after SimBrief, `/profile` stats page

13. **Settings page** — `/settings` with theme, aircraft management, favorites, data export

14. **Dice / Random button** — random route, airport, country per section

15. **Schedule Agenda view** — month calendar + per-day flight card list (agenda style)

### Phase 4 — Quality of Life

16. **Help pages** — `/help/schedule` and `/help/circular-routes`

17. **Local data cache** — preload airports/airlines/countries into sessionStorage for instant autocomplete

18. **Animated collapsible header** — hide header on scroll down, reveal on scroll up (Framer Motion or CSS transition)

---

## Appendix: File Change Index

| File / New File | Change |
|-----------------|--------|
| `tailwind.config.js` | Add brand color tokens |
| `src/app/globals.css` | Add CSS variables for brand colors |
| `src/components/layout/Header.tsx` | Dark mode black bg, yellow title |
| `src/components/layout/Nav.tsx` | Restructure to 5 tabs, add icons |
| `src/components/ui/AirlineLogo.tsx` | **New** — airline logo img with fallback |
| `src/components/ui/HaulBadge.tsx` | **New** — short/medium/long pill badge |
| `src/components/RouteDetailsPopup.tsx` | Bottom-sheet style, add logo, haul badge, flight log |
| `src/components/CircularRouteDetailsPopup.tsx` | Bottom-sheet style |
| `src/app/profile/page.tsx` | **New** — Pilot Profile page |
| `src/app/settings/page.tsx` | **New** — Settings page |
| `src/app/help/schedule/page.tsx` | **New** — Schedule help article |
| `src/app/help/circular-routes/page.tsx` | **New** — Circular routes help article |
| `src/components/lists/CombinedRoutesList.tsx` | **New** — sub-tab container |
| `src/components/lists/CombinedDestinationsList.tsx` | **New** — sub-tab container |
| `src/components/modals/FlightLogModal.tsx` | **New** — post-SimBrief log prompt |
| `src/types/schedule.ts` | Add `FlightLog`, `FlightStats`, `Aircraft` types |
| `src/lib/storage.ts` | **New** — localStorage helpers for logs, favorites, aircraft |
