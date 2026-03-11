# Barangay Milagrosa Website

A civic web portal for Barangay Milagrosa that centralizes community services for residents and staff, reducing the need for in-person visits to the barangay hall.

## Features

- **Announcements** — Community news and official notices
- **Document Requests** — Online requests for barangay certificates and clearances
- **Court Reservations** — Booking of basketball courts and multi-purpose halls
- **Complaint Reporting** — Submitting and tracking complaints
- **Transparency Portal** — Public records, budget reports, and project updates
- **Tanod Tracking** — Real-time patrol monitoring of Barangay Tanod (community watch)
- **User Management** — Staff dashboard for managing resident and staff accounts (ban, unban, delete, create)

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |
| Backend | Firebase (Auth, Firestore, Storage, Realtime Database) |

## Project Structure

```
src/
├── actions/         # Server actions (auth)
├── app/             # Next.js App Router pages
│   ├── page.tsx     # Public landing page
│   ├── resident/    # Resident dashboard
│   └── staff/       # Staff dashboard & user management
├── components/      # Shared UI components
├── contexts/        # React context providers (auth)
├── hooks/           # Custom hooks
├── lib/             # Utilities & Firebase config
├── schemas/         # Zod validation schemas
├── services/        # Server-side data services
└── types/           # TypeScript type definitions
```

## Authentication

The app uses a two-tier auth system with Firebase Auth and server-side session cookies:

- **Residents** sign up and log in via the resident portal
- **Staff** accounts (Admin, Super Admin, Tanod) are created by Super Admins and log in via the staff portal
- Sessions are managed with 5-day `httpOnly` cookies via Firebase Admin SDK
- Route access is enforced server-side via middleware

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, Storage, and Realtime Database enabled

### Environment Variables

Create a `.env.local` file in the root with your Firebase credentials:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```
