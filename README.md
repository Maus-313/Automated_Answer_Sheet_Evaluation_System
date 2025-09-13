<!-- UI Preview -->
<p align="center">
  <img src="docs/assets/ui_preview.png" alt="AASES UI Preview" />
  <br />
  <em>UI preview of Automated Answer Sheet Evaluation System</em>
  <br /><br />
</p>

This is a [Next.js](https://nextjs.org) project 

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Deploy on Vercel

We will depoly in future

## OCR via Google Cloud Vision

This project includes an OCR example that extracts text from images using Google Cloud Vision.

- API route: `src/app/api/vision-ocr/route.ts`
- Client component: `src/components/ImageOcr.tsx`

Setup:
- Enable the Vision API in your Google Cloud project.
- Add an API key to `.env.local`, otherwise it won't work:

```
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
```

## Prompt Runner

- UI: `src/components/PromptRunner.tsx`
- API: `src/app/ai/route.ts`

What it does:
- Sends your prompt to Google Gemini (`gemini-2.0-flash-001`) and shows the text response.
- Optional system instruction can be provided via an env var.

Environment variables (create `.env.local`):

```
GEMINI_API_KEY=your_gemini_api_key
# Optional system prompt injected into the model config
CUSTOM_PROMPT=You are a helpful assistant.
```

Usage:
- Import `PromptRunner` into a page and render it. It includes an input, a Run button, and an output box.
- The API route expects `{ prompt: string }` in the request body and returns `{ output: string }`.

Notes:
- Errors are shown inline in the UI. While loading, the output shows “Loading…”.
- You can change the model name and config in `src/app/ai/route.ts`.

## Answer Sheet Display

- UI: `src/components/AnswerSheetTable.tsx`
- API: `src/app/answers/route.ts`
- Schema: `prisma/schema.prisma` (model `AnswerSheet`)

What it does:
- Fetches answer sheets from your database via Prisma and renders a responsive table.
- “Roll No” stays on one line (no wrapping) and the table expands horizontally if needed.

Prisma model summary:
- Primary key: `rollNo` (String)
- Fields: `name`, `slot`, `examType` (enum: `CAT` | `FAT`), `totalMarks` (Int), `answer1..answer10` (Int?)

Note: Add empty .env in the prisma folder and main DBURL in .env.local

Setup database:
1. Set `DATABASE_URL` in `.env` or `.env.local` (Prisma uses `prisma/.env` for CLI by default):

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

2. Push the schema and generate client:

```bash
npm run prisma:push
npm run prisma:generate
```

3. Start dev and open the app to see the table. If the table is empty, you’ll see a helpful message.

## License

This project is licensed under the MIT License. See `license.md` for details.
