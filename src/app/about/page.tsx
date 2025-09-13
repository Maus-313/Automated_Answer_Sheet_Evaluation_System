export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">About</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Automated Answer Sheet Evaluation System (AASES)
      </p>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          AASES streamlines the evaluation workflow by digitizing question papers, answer
          sheets, and marking schemes. It supports slot-based filtering, dynamic dark mode,
          and integrates with a backend database via Prisma.
        </p>
        <p>
          This demo showcases fetching and rendering Question Papers, Answer Sheets, and
          Marking Sheets, with simple controls for filtering and appearance.
        </p>
      </div>
    </main>
  );
}

