# GitHub Copilot Instructions

## Framework & Routing

- Use the Next.js App Router (`src/app/` directory). Do not use the Pages Router.
- Prefer Server Components by default. Use `"use client"` only when necessary (e.g., event handlers, browser APIs, client-side state).
- Follow Next.js file conventions: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.

## UI & Styling

- Build responsive and accessible components (WCAG-compliant).
- Maintain consistent UI patterns, spacing, and typography across the app.
- Use Tailwind CSS for all styling. Do not use inline styles or other CSS frameworks.
- Use Shadcn UI for all base UI components whenever applicable.
- Use `lucide-react` for all icons. Do not introduce other icon libraries.

## Shadcn UI Installation & Usage

Initialize Shadcn UI using the official CLI:

```bash
npx shadcn@latest init
```

Configuration rules:

- Use TypeScript
- Use Tailwind CSS
- Set the components path to `src/components/ui`
- Set the utils path to `src/lib/utils`
- Enable CSS variables

Add components only via the CLI:

```bash
npx shadcn@latest add <component>
```

- Do not manually copy Shadcn UI components.
- Customize Shadcn components only when necessary and keep changes minimal.
- Keep Shadcn components updated and consistent across the project.

## Forms & Validation

- Use `react-hook-form` for all forms.
- Use `Zod` for schema-based validation and type inference.
- Share validation schemas between client and server when applicable.

## Architecture & Code Quality

- Keep the project modular and scalable using reusable components and hooks.
- Prefer feature-based colocation — keep components, hooks, and schemas together.
- Follow TypeScript-first practices with strict typing.
- Avoid prop drilling; use composition or context when appropriate.
- Do not duplicate logic — extract shared logic into utilities.

## Data Fetching & Performance

- Prefer Server Actions and server-side data fetching.
- Use React Suspense, streaming, and `loading.tsx` for async states.
- Avoid unnecessary client-side state and effects.
- Use dynamic rendering only when required.

## General Rules

- Follow existing project structure and naming conventions.
- Write clean, readable, self-documenting code.
- Avoid unnecessary dependencies.
- Ensure compatibility across modern browsers and screen sizes.
