# Zoe's Vet Surgery

This is a client side only web app which simulates a Vet's surgery booking and triage system. It will be used as a child's toy app for children interested in the profession and wanting to play at being a vet. The app will allow the child to book appointments for their pets, and then triage them based on their symptoms.

The system should:

- Allow a login with a username and password
- Allow adding pet owners to the system as clients
- Allow adding pets owned by a client
- Allow booking in a pet for an appointment
- Allow adding appointment notes including diagnoses and basic physical checkup results
- Allow adding procedures for pets such as operations or medication
- Present a medication catalogue section to allow viewing, editing, adding and deleting medications
- Present a treatment catalogue section to allow viewing, editing, adding and deleting treatments
- A simple calendar view of upcoming appointments by day, week or month

The system should provide the following seeded data:

- A list of 20 clients each with one or two pets of species common to households
- A list of pseudo medications with appropriate usage notes
- A list of pseudo treatments with appropriate usage notes
- 10 appointmnts already booked for pets, each with a health problem for the vet to treat
- A mechanism for automatically adding more appointments of varying severities by clicking a button

## Technology
This is a client side app and does not require a backend database - all data should be stored client-side in the browser using Local Storage or IndexedDB. The system should use ES6 javascript where possible and may use a client side framework. However the system **MAY NOT** use build tools such as vite, npm, etc. The technology expectations are:

- Vanilla ES6 javascript wherever possible
- CSS for layout and presentation
- Fully responsive layout and navigation
