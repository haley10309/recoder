import { useRef, useState } from "react";
import arrowIcon from "@/assets/shift-fill.svg";

export default function UploadFiles({ 
  setOriginalHtmlFile,
 }) {
  const backUpInputRef = useRef(null);

  const [backUpFile, setBackUpFile] = useState(null);

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

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
    <div className="w-full">
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        {/* TOBE코드.html 업로드 박스 */}
        <div 
          className="flex flex-col justify-center items-center w-[330px] h-[160px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" 
          onClick={() => backUpInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 font-[500] text-[15px] text-center">TOBE코드.html 파일을 업로드 해 주세요</p>
          <p className="mt-3 font-[500] text-[12px] text-center text-[#6b7280]">*템플릿 생성은 UK 기준이므로 UK 파일 업로드</p>
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
