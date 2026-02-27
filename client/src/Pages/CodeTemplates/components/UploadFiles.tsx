import { useRef,useState } from "react";

import arrowIcon from "@/assets/shift-fill.svg";
import { formatFileSize } from "@/utils/codeUtils";

export default function UploadFiles({ 
  pptTxtFile,
  handlePptTxtFileChange,
  backupHtmlFile,
  handleBackUpHtmlFileChange,
 }) {
  const pptInputRef = useRef(null);
  const backUpInputRef = useRef(null);

  const asWasInputRef = useRef<HTMLInputElement | null>(null);
  const toBeInputRef = useRef<HTMLInputElement | null>(null);

  const [asWasFile, setAsWasFile] = useState<File | null>(null);
  const [toBeFile, setToBeFile] = useState<File | null>(null);
  const ready = Boolean(asWasFile && toBeFile);
  return (
    <div className="w-full">
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        {/* PPT.txt 업로드 박스 */}

        <div className="flex flex-col justify-center items-center w-[330px] h-[160px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" onClick={() => pptInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 text-[#32383E] font-[500] text-[15px] text-center">PPT.txt 파일을 업로드 해 주세요</p>

          <input
            type="file"
            accept=".txt"
            ref={asWasInputRef}
            onChange={(e) => setAsWasFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <input
            type="file"
            accept=".txt"
            ref={toBeInputRef}
            onChange={(e) => setToBeFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <button type="button" onClick={() => asWasInputRef.current?.click()}>
            AS-WAS 파일 선택
          </button>

          <button type="button" onClick={() => toBeInputRef.current?.click()}>
            TO-BE 파일 선택
          </button>

          {/* 파일명 표시(선택) */}
          <div className="text-sm mt-2">
            <div>AS-WAS: {asWasFile?.name ?? "미선택"}</div>
            <div>TO-BE: {toBeFile?.name ?? "미선택"}</div>
          </div>

          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (!asWasFile || !toBeFile) return;
              handlePptTxtFileChange(asWasFile, toBeFile);
            }}
            className="mt-4 disabled:opacity-40"
          >업로드</button>

          {!!pptTxtFile && (
            <div className="mt-2 text-center text-[13px]">
              <p className="text-black">{pptTxtFile.name}</p>
              <p className="text-black">{formatFileSize(pptTxtFile.size)}</p>
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
          {!!backupHtmlFile && (
            <div className="mt-2 text-center text-[13px]">
              <p>{backupHtmlFile.name}</p>
              <p>{formatFileSize(backupHtmlFile.size)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
