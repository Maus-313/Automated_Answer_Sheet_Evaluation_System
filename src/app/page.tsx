"use client";

import AnswerSheetTable from "@/components/AnswerSheetTable";
import ImageOcr from "@/components/ImageOcr";
import PromptRunner from "@/components/PromptRunner";


export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-3xl mx-auto">
        {/* <AnswerSheetTable /> */}
        {/* <PromptRunner /> */}
        <ImageOcr />
      </main>
    </div>
  );
}
