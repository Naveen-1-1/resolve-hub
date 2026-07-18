# ResolveHub

ResolveHub is a client-rendered customer support application. Customers can
search a FAQ library, track support sessions, and escalate unresolved questions
to tickets. Support agents manage the ticket queue, while knowledge admins
maintain FAQs and review support metrics.

## Project information

- **Author:** Naveen Shankar
- **Class link:** TODO
- **Project objective:** Provide one simple workflow from self-service FAQ
  research to tracked agent support.
- **Screenshot:** TODO
- **Design document:** TODO
- **Deployed application:** TODO
- **Narrated demo:** TODO

## Technology

- React, React Router, React-Bootstrap, HTML, and component CSS
- Node.js and Express
- MongoDB with the native Node.js driver
- Passport Local, express-session, and bcrypt
- Native browser `fetch` for all AJAX requests

The project does not use Axios, Mongoose, or CORS.

## Roles and features

### Customer

1. Register or log in.
2. Start a support session.
3. Search FAQs by title or category and view answers.
4. Resolve the session or escalate it into a ticket.
5. Review session history, viewed FAQ details, escalated ticket context, ticket
   status, and notifications.

### Support agent

1. Log in with the demo agent account.
2. Filter the ticket queue by status or priority.
3. Review the linked support-session context.
4. Assign a ticket to yourself and move it from open to in progress to
   resolved.

### Knowledge admin

1. Log in with the demo admin account.
2. Review session, ticket-status, notification, and resolution-time metrics.
3. Register customer, support-agent, and admin accounts.
4. Search, create, edit, and delete FAQ articles.

## Local setup

Requirements:

- A current Node.js version
- A MongoDB Atlas connection string

Create a `.env` file from `.env.example`:

```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=resolve_hub
BACKEND_PORT=8000
FRONTEND_PORT=3000
SESSION_SECRET=replace-with-a-long-random-string
```

Install dependencies:

```sh
npm install
npm --prefix frontend install
```

Seed the database with the 1,000 Mockaroo FAQs and three demo users:

```sh
npm run seed
```

Run the backend:

```sh
npm run dev
```

Run the frontend in a second terminal:

```sh
npm --prefix frontend run dev
```

Open `http://localhost:3000`.

## Demo accounts

- Customer: `customer@resolvehub.demo` / `Customer123!`
- Agent: `agent@resolvehub.demo` / `Agent123!`
- Admin: `admin@resolvehub.demo` / `Admin123!`

These credentials are synthetic and intended only for the course demonstration.

## Available commands

- `npm start` — start the Express server
- `npm run dev` — start Express with nodemon
- `npm run build` — create the React production build
- `npm run seed` — import the Mockaroo FAQ data and demo users
- `npm run lint:check` — check the repository with ESLint
- `npm --prefix frontend run lint` — check the frontend ESLint configuration
- `npm run format:check` — check formatting with Prettier

## Data collections

ResolveHub uses `users`, `faqs`, `supportSessions`, `tickets`, and
`notifications`. Full CRUD is implemented for FAQs. The source FAQ data is in
`data/import/faqs.json`.

## Deferred course deliverables

- Design document and mockups
- Class URL
- Final screenshot and thumbnail
- Render configuration and public deployment
- Public narrated demo
- Peer-review evidence
- Google Form submission
- Code-freeze confirmation

## License

This project is available under the [MIT License](LICENSE).
