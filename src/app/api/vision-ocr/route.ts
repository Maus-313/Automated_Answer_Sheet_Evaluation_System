import { NextRequest } from "next/server";

export const runtime = "nodejs";

type OcrRequestBody = {
  images: Array<{
    filename?: string;
    mimeType?: string;
    contentBase64: string; // raw base64, no data: prefix
  }>;
  // Optional: "DOCUMENT_TEXT_DETECTION" for dense docs, otherwise TEXT_DETECTION
  mode?: "TEXT_DETECTION" | "DOCUMENT_TEXT_DETECTION";
  languageHints?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const key = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_CLOUD_VISION_API_KEY in env" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const body = (await req.json()) as OcrRequestBody;
    if (!body?.images?.length) {
      return new Response(
        JSON.stringify({ error: "No images provided" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const featureType = body.mode ?? "DOCUMENT_TEXT_DETECTION";

    const requests = body.images.map((img) => ({
      image: { content: img.contentBase64 },
      features: [{ type: featureType }],
      imageContext: body.languageHints ? { languageHints: body.languageHints } : undefined,
    }));

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requests }),
      }
    );

    if (!visionRes.ok) {
      const text = await visionRes.text();
      return new Response(
        JSON.stringify({ error: "Vision API error", status: visionRes.status, body: text }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const json = (await visionRes.json()) as any;
    const responses = Array.isArray(json?.responses) ? json.responses : [];

    const results = responses.map((r: any, idx: number) => {
      const text = r?.fullTextAnnotation?.text || r?.textAnnotations?.[0]?.description || "";
      return {
        index: idx,
        text,
        warnings: r?.error ? [r.error.message] : undefined,
      };
    });

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

