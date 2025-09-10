"use client";

import AnswerSheetTable from "@/components/AnswerSheetTable";
import QuestionPaper from "@/components/QuestionPaper";
import MarkingScheme from "@/components/MarkingScheme";


export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full mx-auto">
        <QuestionPaper
          subject="Applied Mathematics"
          slot="A1"
          courseCode="MATH101"
          examType="CAT"
          questions={[
            { no: 1, text: "Define and give an example of a continuous function." },
            { no: 2, text: "Evaluate the integral ∫(2x + 3) dx." },
            { no: 3, text: "Solve the differential equation dy/dx = 3y." },
            { no: 4, text: "State the Mean Value Theorem." },
            { no: 5, text: "Find the derivative of x^x." },
          ]}
        />

        <MarkingScheme
          courseCode="MATH101"
          examType="CAT"
          items={[
            { no: 1, marks: 5, criteria: "Definition (3), example (2)" },
            { no: 2, marks: 5, criteria: "Correct antiderivative and constant" },
            { no: 3, marks: 5, criteria: "General solution with constant" },
            { no: 4, marks: 5, criteria: "Statement with conditions" },
            { no: 5, marks: 5, criteria: "Log differentiation steps" },
          ]}
        />

        <AnswerSheetTable />
      </main>
    </div>
  );
}
