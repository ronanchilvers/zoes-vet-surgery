# Browser QA Checklist

Use this checklist for final review of Zoe's Vet Surgery after static JavaScript or CSS changes. When testing through the PHP server, use a cache-busted URL or hard reload before trusting a result.

## Setup

- Serve from the project root with `php -S 127.0.0.1:8765`.
- Open `http://127.0.0.1:8765/?qa=<timestamp>`.
- Log in with any username and password.
- Confirm the browser console has no errors after each major workflow.

## Desktop View

- Dashboard shows today's queue, urgent cases, recent patients, and quick actions.
- Clients, pets, appointments, medications, and treatments can be searched without losing input focus.
- Add/edit forms show an announced error and field-level hints when submitted empty.
- Delete actions ask for confirmation or explain blocked deletion when linked records exist.
- Appointment status changes update dashboard and calendar summaries after navigation.
- Calendar day, week, and month modes show the expected ranges and entries.
- Calendar entries open the matching appointment detail view.
- Export data downloads a JSON file.
- Import blocks invalid JSON and asks before replacing current data.

## Mobile View

Test at `390 x 844` or a similar phone viewport.

- Top navigation scrolls horizontally without clipping text.
- Dashboard panels stack cleanly with no body-level horizontal overflow.
- Record lists and inspector panels stack cleanly.
- Forms keep labels, controls, errors, and submit buttons readable.
- Calendar week/day views fit the page width.
- Calendar month view scrolls inside the calendar workspace instead of widening the whole page.

## Keyboard And Focus

- Tab order reaches navigation, primary actions, search fields, list rows, form fields, and submit buttons.
- Current navigation item exposes `aria-current="page"`.
- Visible focus rings are present on buttons, inputs, selects, textareas, and alerts.
- Error notices receive focus once after failed submit and do not steal focus during later search typing.
- Invalid form controls expose `aria-invalid="true"` and an error description.

## Persistence

- Edits survive browser refresh.
- Reset restores seeded clients, pets, appointments, medications, treatments, and empty procedures.
- Exported data can be imported back into a fresh reset state.
- Import rejects files with missing collections or broken relationships.
