import { useState } from "react";

import { savePreCoderResult } from "@/apis/preCoderApis";
import type { CopyDeckRow, PreCoderAnalysisResult } from "../utils/analyzePreCoder";

export function usePreCoderSave({
  htmlFile,
  excelFile,
  copyDeckRows,
  result,
}: {
  htmlFile: File | null;
  excelFile: File | null;
  copyDeckRows: CopyDeckRow[] | null;
  result: PreCoderAnalysisResult | null;
}) {
  const [saveStatus, setSaveStatus] = useState<"" | "loading" | "success" | "fail">("");

  const handleSave = async (title: string) => {
    if (!htmlFile || !excelFile || !copyDeckRows || !result) {
      alert("먼저 검사를 실행한 뒤 저장할 수 있습니다.");
      return;
    }
    if (!title.trim()) {
      alert("저장할 결과의 제목을 입력해주세요.");
      return;
    }

    try {
      setSaveStatus("loading");
      await savePreCoderResult({
        title,
        htmlFile,
        excelFile,
        copyDeckJson: JSON.stringify(copyDeckRows),
        resultJson: JSON.stringify(result),
      });
      setSaveStatus("success");
      alert("검사 결과가 저장되었습니다. 다른 사용자도 결과 목록에서 확인할 수 있어요.");
    } catch (error) {
      console.error("[usePreCoderSave] 에러", error);
      setSaveStatus("fail");
    }
  };

  const resetSaveStatus = () => setSaveStatus("");

  return { saveStatus, handleSave, resetSaveStatus };
}
