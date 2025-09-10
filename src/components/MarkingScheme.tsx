type MarkSchemeItem = {
  no: number;
  marks: number;
  criteria?: string;
};

type MarkingSchemeProps = {
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  items: MarkSchemeItem[]; // 5–10 depending on exam
};

export default function MarkingScheme({ courseCode, examType, items }: MarkingSchemeProps) {
  const total = items.reduce((sum, i) => sum + (i.marks || 0), 0);

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Marking Scheme</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
          <div className="text-muted-foreground">Course Code</div>
          <div className="font-medium">{courseCode}</div>
        </div>
        {examType ? (
          <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
            <div className="text-muted-foreground">Exam Type</div>
            <div className="font-medium">{examType}</div>
          </div>
        ) : null}
        <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
          <div className="text-muted-foreground">Total Marks</div>
          <div className="font-medium">{total}</div>
        </div>
      </div>

      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
        {items.length === 0 ? (
          <div className="px-3 py-2 text-sm">No marking items provided</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                <th className="px-3 py-2 text-left font-medium">Criteria</th>
                <th className="px-3 py-2 text-left font-medium w-24">Marks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.no} className="border-b border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{m.no}</td>
                  <td className="px-3 py-2 align-top text-pretty">{m.criteria ?? "—"}</td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">{m.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

