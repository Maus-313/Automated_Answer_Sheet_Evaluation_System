This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## OCR via Google Cloud Vision

This project includes an OCR example that extracts text from images using Google Cloud Vision.

- API route: `src/app/api/vision-ocr/route.ts`
- Client component: `src/components/ImageOcr.tsx`

Setup:
- Enable the Vision API in your Google Cloud project.
- Add an API key to `.env.local`:

```
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
```

Usage:
- Import and render the component in a page, for example in `src/app/page.tsx`:

```tsx
import ImageOcr from "@/components/ImageOcr";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>OCR Demo</h1>
      <ImageOcr />
    </main>
  );
}
```

Notes:
- The dev build indicator shown during development cannot be disabled in Next 15; it won’t show in production (`npm run build && npm run start`).
- Images are read locally in the browser, converted to base64, and sent to the API; nothing is stored server-side.
