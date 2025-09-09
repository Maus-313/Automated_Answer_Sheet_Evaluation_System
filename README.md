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