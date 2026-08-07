# Gillu AI - Wardrobe Scanner

An AI-powered wardrobe scanner built with Next.js, Supabase, and Gemini 2.0 Flash Lite (via OpenRouter). Point your camera at any clothing item to get instant AI identification, styling tips, and wardrobe management.

## Features

- **Camera Scanner**: Uses the browser's MediaDevices API for real-time camera access (front/back camera toggle)
- **AI Analysis**: Sends captured images to Gemini 2.0 Flash Lite via OpenRouter for clothing identification
- **Wardrobe Database**: Supabase-backed storage with Row Level Security for per-user wardrobe items
- **Responsive Design**: Mobile-first UI built with Tailwind CSS v4, optimized for phone scanning
- **Server + Client Supabase**: Both browser-side and server-side Supabase clients configured

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Gemini 2.0 Flash Lite via OpenRouter API
- **Camera**: Browser MediaDevices API

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Set up the database

Run the SQL in `init.sql` in your Supabase SQL Editor to create the `wardrobe` table with RLS policies.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Cloud IDE / Port Forwarding

If running on a Cloud IDE, the dev server binds to `0.0.0.0:3000` by default. Use your IDE's port forwarding or preview URL to access the app from your phone. The `next.config.ts` includes `allowedDevOrigins: ["*"]` to permit cross-origin dev access.

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout
    page.tsx            # Home page with link to scanner
    scanner/
      page.tsx          # Wardrobe Scanner (camera + AI analysis)
    api/
      analyze/
        route.ts        # AI route - sends base64 image to Gemini via OpenRouter
  lib/
    supabase/
      client.ts         # Browser-side Supabase client
      server.ts         # Server-side Supabase client (cookies-based)
init.sql                # Database schema for wardrobe table
```

## License

MIT
