import { useState } from "react";
import axios from "axios";

import { BASE_URL } from "@/utils/routePath";
import { isAssetCode } from "@/utils/codeUtils";

export const useFileUpload = ({ 
  setNonAssetCodeChanges,
  setOriginalHtmlFile,
 }) => {
  const [pptFile, setPptFile] = useState(null);
  const [backUpFile, setBackUpFile] = useState(null); // TODO: backup, original 중 용어 통일하기 (일단 backup)

  // PPT.txt 업로드 처리
  const handlePptSubmit = async (file) => {
    const formData = new FormData();
    formData.append("txtfile", file);
    try {
      const res = await axios.post(`${BASE_URL}/upload-guide`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { pptNos = [], asWasCodes = [], toBeCodes = [] } = res.data;
      if (!Array.isArray(pptNos) || !Array.isArray(asWasCodes) || !Array.isArray(toBeCodes)) {
        throw new Error("Invalid data format from server");
      }

      const assetCodeChanges = [];
      const nonAssetCodeChanges = [];

      pptNos.forEach((pptNo, idx) => {
        const aswasCode = asWasCodes[idx] || "";
        const tobeCode = toBeCodes[idx] || "";
        if (isAssetCode(aswasCode)) { // (250519 기준) aswasCode가 asset인지 아닌지로 판단.
          assetCodeChanges.push({
            ppt_no: pptNo,
            aswas_code: aswasCode,
            tobe_code: tobeCode,
          });
        } else {
          nonAssetCodeChanges.push({
            ppt_no: pptNo,
            aswas_code: aswasCode,
            tobe_code: tobeCode,
          });
        }
      });

      // setAssetCodeChanges(assetCodeChanges);
      setNonAssetCodeChanges(nonAssetCodeChanges);
    } catch (error) {
      console.error("Error uploading PPT file:", error);
      alert("PPT 업로드에 실패했습니다.");
    }
  };
  
  const handlePptFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPptFile(f);
    handlePptSubmit(f);
  };

  // 원본코드.html 파일 처리
  const handleBackUpHtmlFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBackUpFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalHtmlFile(ev.target.result);
    reader.readAsText(f);
  };
  
  return {
    pptFile,
    backUpFile,
    handlePptFileChange,
    handleBackUpHtmlFileChange,
  }
}