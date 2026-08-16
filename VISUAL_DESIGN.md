# ResolveHub Visual Design

## Project Description

ResolveHub uses a clean and organized design for finding answers, getting
support, managing tickets, and maintaining help articles.

## Color Palette

The navy and blue colors create a calm and trustworthy support experience.

View the [color palette image](./docs/color-palette.png).

Exact colors: navy `#17324d`, text `#25384a`, blue `#1769aa`, background
`#f4f7fa`, border `#dce4ec`, muted `#5b6d7c`, success `#177245`, warning
`#9a6700`, and danger `#b42318`.

Soft colors: white `#ffffff`, success `#eaf7f1`, warning `#fff8e1`, danger
`#fff1f0`, and information `#e7f4ff`.

## Typography

The design uses a clear, modern font for headings, body text, labels, and
buttons. A fixed-width font is used for numbers, statuses, and other details
that need to line up neatly.

## Layout and Hierarchy

Pages are centered with generous spacing and clear groups of related content.
The home page emphasizes the main message and getting started.

The customer page leads with the active session, then shows notifications,
FAQs, and tickets. The agent page leads with filters and the ticket queue.

The admin page separates activity information from performance information and
keeps the main management areas in clearly labelled tabs.

## Components and States

Cards group related information. Buttons, alerts, and messages use consistent
colors so users can understand what happened and what to do next.

Ticket progress is shown from open, to in progress, to resolved. Hovered,
selected, successful, and error states are clearly visible.

## Responsive Design

The layout rearranges itself on smaller screens so content remains readable.
Dashboard columns become stacked sections, and long forms become easier to use.

## Accessibility

Pages use clear headings, meaningful sections, standard buttons and form
fields, visible focus indicators, and text descriptions instead of relying
only on color.

The application can be used with a keyboard, and important content receives
focus after actions such as selecting a ticket or changing a filter.

## Accessibility Checks

Accessibility checks cover the home, login, registration, customer, agent, and
admin pages. They confirm good contrast, clear labels, readable structure, and
proper page landmarks.

- [Home report](./docs/accessibility/home.html)
- [Login report](./docs/accessibility/login.html)
- [Registration report](./docs/accessibility/register.html)
- [Customer report](./docs/accessibility/customer.html)
- [Agent report](./docs/accessibility/agent.html)
- [Admin report](./docs/accessibility/admin.html)

One notification button has a label that is more detailed than its visible
text and should be reviewed.
