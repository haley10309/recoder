import { useState } from "react";

import { isAssetCode } from "@/utils/codeUtils";
import defaultAxios from "@/apis/defaultAxios";

export const useFileUpload = ({
  setCodeChanges,
  setBackupHtmlContent,
}) => {
  const [pptTxtFile, setPptTxtFile] = useState(null);
  const [backupHtmlFile, setBackupHtmlFile] = useState(null);

  // PPT.txt 업로드 처리
  const _handlePptTxtFileSubmit = async (file) => {
    const formData = new FormData();
    formData.append("txtfile", file);
    try {
      const res = await defaultAxios.post(`/upload-guide`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { pptNos = [], asWasCodes = [], toBeCodes = [] } = res.data;
      if (!Array.isArray(pptNos) || !Array.isArray(asWasCodes) || !Array.isArray(toBeCodes)) {
        throw new Error("Invalid data format from server");
      }

      const codeChanges = [];

      pptNos.forEach((pptNo, idx) => {
        const aswasCode = asWasCodes[idx] || "";
        const tobeCode = toBeCodes[idx] || "";
        if (!isAssetCode(aswasCode)) { // (250519 기준) aswasCode가 asset인지 아닌지로 판단.
          codeChanges.push({
            ppt_no: pptNo,
            aswas_code: aswasCode,
            tobe_code: tobeCode,
          });
        } else {
        }
      });

      setCodeChanges(codeChanges);
    } catch (error) {
      console.error("Error uploading PPT file:", error);
      alert("PPT 업로드에 실패했습니다.");
    }
  };
  
  const handlePptTxtFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPptTxtFile(f);
    _handlePptTxtFileSubmit(f);
  };

  // 원본코드.html 파일 처리
  const handleBackUpHtmlFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBackupHtmlFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setBackupHtmlContent(ev.target.result);
    reader.readAsText(f);
  };

  return {
    pptTxtFile,
    backupHtmlFile,
    handlePptTxtFileChange,
    handleBackUpHtmlFileChange,
  };
};
