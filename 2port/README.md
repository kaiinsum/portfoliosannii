## Angular Dual‑Mode Portfolio (Design / Technical) + Admin

Production-ready starter portfolio built with modern Angular (standalone + lazy routes), a clean `core/ shared/ features/` structure, and **content managed via JSON + admin CRUD**.

### Features

- **Dual portfolio modes**
  - **Light**: Design Portfolio
  - **Dark**: Technical Portfolio
  - Smooth theme transition + animated avatar flip
  - Persists mode in `localStorage`
- **Sections (per mode)**: About, Projects (grid + modal detail), Contact
- **Admin panel**
  - `/admin/login` → login
  - `/admin` → edit About, Contact, and Projects (Add/Edit/Delete)
  - Persisted to `localStorage`, **seeded from JSON** on first run
  - Optional image upload: stores images as data URLs in `localStorage` (no backend)
- **Assets structure**
  - `src/assets/avatar/`
  - `src/assets/projects/design/`
  - `src/assets/projects/technical/`
  - `src/assets/data/design/`
  - `src/assets/data/technical/`

### Setup

```bash
npm install
npm start
```

Then open the app at `http://localhost:4200/`.

### Admin access

Credentials are in:

- `mk.txt`
- `src/environments/environment.ts` (mirrors `mk.txt`)

Go to:

- `/admin/login`

### How content works

On first visit, the app seeds content into `localStorage` from JSON:

- Design mode:
  - `src/assets/data/design/about.json`
  - `src/assets/data/design/projects.json`
  - `src/assets/data/design/contact.json`
- Technical mode:
  - `src/assets/data/technical/about.json`
  - `src/assets/data/technical/projects.json`
  - `src/assets/data/technical/contact.json`

After that:

- The site reads from `localStorage`
- The Admin panel updates the same stored data
- In Admin, **“Reset this mode to JSON defaults”** restores from the JSON files

### Add / replace project images

- Design images: `src/assets/projects/design/`
- Technical images: `src/assets/projects/technical/`

Two options:

- **Static assets**: copy images into the folders above, then set `image` to `assets/projects/.../your-file.png`
- **Upload in Admin**: use the file picker in the project editor (saved to `localStorage` as a data URL)

### Where to customize UI

- Global theme tokens: `src/styles.css`
- Shell header + avatar animation: `src/app/features/portfolio/portfolio-shell/portfolio-shell.page.*`

# Routing

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
