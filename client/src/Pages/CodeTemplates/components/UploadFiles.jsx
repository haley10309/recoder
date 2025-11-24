import { useRef } from "react";

import arrowIcon from "@/assets/shift-fill.svg";

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadFiles({ 
  pptFile,
  handlePptFileChange,
  backUpFile,
  handleBackUpHtmlFileChange,
 }) {
  const pptInputRef = useRef(null);
  const backUpInputRef = useRef(null);


  return (
    <div className="w-full">
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        {/* PPT.txt 업로드 박스 */}

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

        {/* 원본코드.html 업로드 박스 */}
        <div 
          className="flex flex-col justify-center items-center w-[330px] h-[160px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" 
          onClick={() => backUpInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 font-[500] text-[15px] text-center">원본코드.html 파일을 업로드 해 주세요</p>
          <p className="mt-3 font-[500] text-[12px] text-center text-[#6b7280]">*템플릿 생성은 UK 기준이므로 UK 파일 업로드</p>
          <input type="file" accept=".html" ref={backUpInputRef} onChange={handleBackUpHtmlFileChange} className="hidden" />
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
