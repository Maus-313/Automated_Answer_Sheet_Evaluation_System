import AnswerSheetTable from "@/components/AnswerSheetTable";
import QuestionPaper from "@/components/QuestionPaper";
import MarkingScheme from "@/components/MarkingScheme";
import ImageOcr from "@/components/ImageOcr";
import { Prompt } from "next/font/google";
import PromptRunner from "@/components/PromptRunner";
import MarkSheetTable from "@/components/MarkSheetTable";
import Evaluator from "@/components/Evaluator";
import Image from "next/image";
import { Text } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[12px_1fr_12px] items-center justify-items-center min-h-screen p-4 pb-12 gap-6 sm:p-8 sm:pb-14 sm:gap-8">
      <main className="row-start-2 w-full">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
          <QuestionPaper />
          <MarkingScheme />
          <AnswerSheetTable />
          <Evaluator />
          <MarkSheetTable />
          {/* <PromptRunner/> */}
          {/* <ImageOcr/> */}
        </div>
      </main>
    </div>
  );
}
