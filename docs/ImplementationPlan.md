# Zoe's Vet Surgery Implementation Plan

This plan breaks the specification into phases that can be implemented and reviewed independently. The app is client-side only, with no build tools, so the implementation should use plain HTML, CSS, and ES6 JavaScript loaded directly in the browser.

## Guiding Constraints

- Use vanilla ES6 JavaScript wherever practical.
- Do not introduce build tooling such as Vite, npm, bundlers, or transpilers.
- Store all application data in the browser, using Local Storage initially unless a later phase proves IndexedDB is needed.
- Keep the app fully responsive across phone, tablet, and desktop layouts.
- Treat the product as a toy vet surgery system for children: clear labels, forgiving workflows, playful but usable presentation, and no real medical claims.

## Phase 1: App Shell And Navigation

Create the base application structure and visual system.

Deliverables:

- `index.html` with the main app regions.
- `styles.css` with responsive layout, typography, forms, buttons, tables, lists, and calendar primitives.
- `app.js` with initial route/view switching.
- Primary navigation for dashboard, clients, pets, appointments, medications, treatments, and calendar.
- Simple login screen accepting a username and password and storing a session flag locally.
- Empty-state screens for each main section.

Acceptance checks:

- The app opens directly from the HTML file in a browser.
- Login state survives page refresh.
- Navigation works without full page reloads.
- Layout remains usable at common mobile and desktop widths.

Review point:

- Confirm the overall information architecture and visual direction before building the data-heavy workflows.

## Phase 2: Data Model, Storage, And Seed Data

Define the core entities and local persistence layer.

Deliverables:

- Data modules for clients, pets, appointments, appointment notes, medications, treatments, and procedures.
- Local Storage adapter with read, write, reset, and seed initialization helpers.
- Seed data for:
  - 20 clients.
  - One or two household pets per client.
  - Pseudo medications with child-safe fictional names and usage notes.
  - Pseudo treatments with child-safe fictional names and usage notes.
  - 10 pre-booked appointments with health problems to triage.
- Data validation helpers for required fields and ownership relationships.
- Reset-to-seed-data control for development and play reset.

Acceptance checks:

- First app load initializes all required seed data.
- Refreshing the browser preserves edits.
- Reset restores the expected seed dataset.
- Pets remain correctly linked to owners.
- Appointments remain correctly linked to pets and clients.

Review point:

- Review entity shapes and seed data tone before wiring all workflows to them.

## Phase 3: Client And Pet Management

Implement CRUD workflows for owners and their pets.

Deliverables:

- Client list with search or quick filtering.
- Add, edit, view, and delete client workflows.
- Client detail view showing owned pets and appointment history.
- Add, edit, view, and delete pet workflows.
- Pet detail view with species, breed or description, age, owner, appointment history, notes, and procedures.
- Deletion safeguards that explain related records before removing data.

Acceptance checks:

- A child can add a new owner and pet with minimal steps.
- Editing client or pet details updates linked views immediately.
- Deleting a client handles or prevents orphaned pets and appointments.
- Empty and populated states are both clear.

Review point:

- Review the client and pet workflows for ease of play before appointment workflows expand the data model usage.

## Phase 4: Appointment Booking And Triage Notes

Build appointment creation, editing, and consultation note workflows.

Deliverables:

- Appointment list with status, date, pet, owner, reason, and severity.
- Appointment booking form with pet selection, date, time, reason, and severity.
- Appointment detail view.
- Appointment notes form covering:
  - Symptoms.
  - Diagnosis.
  - Basic physical checkup results.
  - Vet notes.
  - Follow-up instructions.
- Status transitions such as booked, in progress, treated, and follow-up needed.
- Button to automatically generate additional appointments of varied severities.

Acceptance checks:

- Appointments can be booked for existing pets.
- Generated appointments are varied, plausible, and linked to existing pets.
- Notes persist across refreshes.
- Appointment status changes are visible in list and detail views.

Review point:

- Review generated appointment content and consultation workflow for play value and clarity.

## Phase 5: Medication, Treatment, And Procedure Workflows

Implement catalog management and pet procedure recording.

Deliverables:

- Medication catalogue with list, add, edit, and delete workflows.
- Treatment catalogue with list, add, edit, and delete workflows.
- Usage notes visible in catalogue detail views.
- Procedure creation from a pet or appointment, with type, notes, date, and optional linked medication or treatment.
- Pet procedure history.
- Appointment note integration for recording medication or treatment used during a visit.

Acceptance checks:

- Catalogue entries can be created, updated, and removed.
- Procedures can be attached to pets and optionally linked to appointments.
- Deleted catalogue items do not break existing procedure history.
- Fictional medical content is clearly playful and non-real.

Review point:

- Review catalogue terminology and procedure flow before calendar and dashboard summarization depend on these records.

## Phase 6: Calendar And Dashboard

Add higher-level views for daily play and appointment planning.

Deliverables:

- Dashboard summarizing today's appointments, urgent cases, recent patients, and quick actions.
- Calendar view with day, week, and month modes.
- Appointment cards grouped by date and severity.
- Calendar navigation controls for previous, next, and today.
- Quick links from calendar entries into appointment detail.

Acceptance checks:

- Day, week, and month views show the correct appointment ranges.
- Calendar remains readable on small screens.
- Appointment updates are reflected in dashboard and calendar views.
- Urgent or high-severity cases are visually distinguishable without overwhelming the interface.

Review point:

- Review whether the dashboard and calendar support the intended play loop before polish.

## Phase 7: Responsive Polish, Accessibility, And Browser QA

Tighten interaction details, accessibility, and resilience.

Deliverables:

- Responsive pass for all screens.
- Keyboard-accessible forms, buttons, dialogs, and navigation.
- Clear focus states.
- Form error messages.
- Confirmation dialogs for destructive actions.
- Basic import/export of local app data if useful for preserving play sessions.
- Browser QA checklist documented in `docs/`.

Acceptance checks:

- All core workflows work with keyboard navigation.
- Text does not overflow buttons, cards, lists, or calendar cells.
- Forms announce errors clearly.
- Data remains usable after refreshes and app restarts.
- No console errors appear during normal workflows.

Review point:

- Final product review across representative mobile and desktop viewport sizes.

## Suggested File Structure

```text
index.html
styles.css
app.js
js/
  data/
    seed.js
    storage.js
    models.js
  views/
    dashboard.js
    login.js
    clients.js
    pets.js
    appointments.js
    catalogues.js
    calendar.js
  utils/
    dates.js
    ids.js
    validation.js
docs/
  Specification.md
  ImplementationPlan.md
```

This structure keeps the app usable without build tooling while avoiding a single very large JavaScript file.

## Implementation Order Recommendation

1. Build the static shell and navigation.
2. Add storage and seed data.
3. Implement clients and pets.
4. Implement appointment booking and notes.
5. Implement catalogues and procedures.
6. Implement calendar and dashboard summaries.
7. Complete responsive, accessibility, and browser QA polish.

## Open Questions For Review

- Should the login accept any username and password, or should there be a seeded toy account?
- Should client and pet deletion remove related appointments, or should deletion be blocked when related records exist?
- Should appointment generation be fully random, or should it cycle through a curated list to keep cases age-appropriate?
- Should the app include import/export of local data in the first version, or leave that for a later enhancement?
- Should medication and treatment names be explicitly fictional to avoid any confusion with real veterinary advice?
