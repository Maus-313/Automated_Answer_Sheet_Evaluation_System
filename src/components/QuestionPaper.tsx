type QuestionPaperProps = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  questions: Array<{ no: number; text: string }>;
};

export default function QuestionPaper(props: QuestionPaperProps) {
  const { subject, slot, courseCode, examType, questions } = props;

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Question Paper</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
        <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
          <div className="text-muted-foreground">Subject</div>
          <div className="font-medium">{subject}</div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
          <div className="text-muted-foreground">Slot</div>
          <div className="font-medium">{slot}</div>
        </div>
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
      </div>

      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
        {questions.length === 0 ? (
          <div className="px-3 py-2 text-sm">No questions provided</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                <th className="px-3 py-2 text-left font-medium">Question</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.no} className="border-b border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{q.no}</td>
                  <td className="px-3 py-2 align-top">{q.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

