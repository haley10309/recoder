import { useState } from "react";

import { verifyTranslationQa } from "@/apis/translationQaApis";

// before/after/xlsx + site_code로 검사를 실행하고 결과 블록을 관리한다.
export function useTranslationQaVerify({
  beforeFile,
  afterFile,
  excelFile,
  siteCode,
}) {
  const [blocks, setBlocks] = useState([]);
  const [verifyStatus, setVerifyStatus] = useState("");

  const handleVerify = async () => {
    if (!beforeFile || !afterFile || !excelFile) {
      alert("before.html / after.html / copy.xlsx 파일을 모두 업로드 해주세요.");
      return;
    }
    if (!siteCode) {
      alert("먼저 Site Code(국가코드)를 선택해주세요.");
      return;
    }

    try {
      setVerifyStatus("loading");
      const result = await verifyTranslationQa({
        beforeFile,
        afterFile,
        excelFile,
        siteCode,
      });

      if (!result?.success) {
        setVerifyStatus("fail");
        alert(result?.error || "검사 중 오류가 발생했습니다.");
        return;
      }

      setBlocks(result.blocks || []);
      setVerifyStatus("success");
    } catch (error) {
      console.error("[handleVerify] 에러", error);
      setVerifyStatus("fail");
    }
  };

  const resetVerify = () => {
    setBlocks([]);
    setVerifyStatus("");
  };

  return {
    blocks,
    verifyStatus,
    handleVerify,
    resetVerify,
  };
}
