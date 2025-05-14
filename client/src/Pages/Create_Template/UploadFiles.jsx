import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import arrowIcon from "@/assets/shift-fill.svg";
import { isAssetCode } from "@/utils/codeUtils";

export default function UploadFiles({ 
  isUploadOnlyOriginHtmlFile,
  setNonAssetPptNos, 
  setNonAssetAsWasCodes, 
  setNonAssetToBeCodes, 
  setAssetPptNos, 
  setAssetAsWasCodes, 
  setAssetToBeCodes,
  setOriginalHtmlFile, 
 }) {
  const pptInputRef = useRef(null);
  const backUpInputRef = useRef(null);

  const [pptFile, setPptFile] = useState(null);
  const [backUpFile, setBackUpFile] = useState(null);

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  // PPT.txt 업로드 처리
  const handlePptSubmit = async (file) => {
    const formData = new FormData();
    formData.append("txtfile", file);
    try {
      const res = await axios.post(`${BASE_URL}/guide-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { pptNos = [], asWasCodes = [], toBeCodes = [] } = res.data;
      if (!Array.isArray(pptNos) || !Array.isArray(asWasCodes) || !Array.isArray(toBeCodes)) {
        throw new Error("Invalid data format from server");
      }

      const nonAssetPptNos = [];
      const nonAssetAsWasCodes = [];
      const nonAssetToBeCodes = [];
      const assetPptNos = [];
      const assetAsWasCodes = [];
      const assetToBeCodes = [];

      pptNos.forEach((pptNo, idx) => {
        const a = asWasCodes[idx] || "";
        const t = toBeCodes[idx] || "";
        if (isAssetCode(a) || isAssetCode(t)) {
          assetPptNos.push(pptNo);
          assetAsWasCodes.push(a);
          assetToBeCodes.push(t);
        } else {
          nonAssetPptNos.push(pptNo);
          nonAssetAsWasCodes.push(a);
          nonAssetToBeCodes.push(t);
        }
      });

      setAssetPptNos(assetPptNos);
      setAssetAsWasCodes(assetAsWasCodes);
      setAssetToBeCodes(assetToBeCodes);

      setNonAssetPptNos(nonAssetPptNos);
      setNonAssetAsWasCodes(nonAssetAsWasCodes);
      setNonAssetToBeCodes(nonAssetToBeCodes);
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
  const handleOriginalHtmlFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBackUpFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalHtmlFile(ev.target.result);
    reader.readAsText(f);
  };

  return (
    <div className="mt-[50px] mb-[50px] w-full">
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📤 파일 업로드</h2>
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        {/* PPT.txt 업로드 박스 */}

        {!isUploadOnlyOriginHtmlFile && (
          <div className="flex flex-col justify-center items-center w-[330px] h-[160px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" onClick={() => pptInputRef.current.click()}>
            <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
            <p className="mt-3 text-[#32383E] font-[500] text-[15px] text-center">PPT.txt 파일을 업로드 해 주세요</p>
            <input type="file" accept=".txt" ref={pptInputRef} onChange={handlePptFileChange} className="hidden" />
            {!!pptFile && (
              <div className="mt-2 text-center text-[13px]">
                <p className="text-black">{pptFile.name}</p>
                <p className="text-black">{formatFileSize(pptFile.size)}</p>
              </div>
            )}
          </div>
        )}

        {/* 원본코드.html 업로드 박스 */}
        <div 
          className="flex flex-col justify-center items-center w-[330px] h-[160px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" 
          onClick={() => backUpInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 font-[500] text-[15px] text-center">원본코드.html 파일을 업로드 해 주세요</p>
          <p className="mt-3 font-[500] text-[12px] text-center text-[#6b7280]">(*템플릿 생성은 UK 기준이므로 UK 파일 업로드. <br/> 250513 이후 변경사항 있으면 데이에게 전달)</p>
          <input type="file" accept=".html" ref={backUpInputRef} onChange={handleOriginalHtmlFileChange} className="hidden" />
          {!!backUpFile && (
            <div className="mt-2 text-center text-[13px]">
              <p>{backUpFile.name}</p>
              <p>{formatFileSize(backUpFile.size)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
