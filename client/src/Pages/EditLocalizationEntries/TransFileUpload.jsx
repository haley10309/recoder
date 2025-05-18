import { useRef, useState } from "react";
import axios from "axios";

import { BASE_URL } from "@/utils/routePath";
import arrowIcon from "@/assets/shift-fill.svg";

export default function TransFileUpload({ 
  isTemplateCreated,
  tobeCodes,
  setEnglishCopyList,
  setLocalizationEntries,
  hasOriginalHtmlFile,
  checkHasInvalidAsWasCount,
}) {
  const transInputRef = useRef(null);
  const [transFile, setTransFile] = useState(null);

  const canUploadTransFile = isTemplateCreated && hasOriginalHtmlFile && !checkHasInvalidAsWasCount();

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleTransSubmit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // 1. englishCopyList 받아오고 업데이트
      const res = await axios.post(
        `${BASE_URL}/localization/english-copy-list`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const englishCopyList = res.data.englishCopyList;
      setEnglishCopyList(englishCopyList);

      // 2. localizationEntries 업데이트
      if (englishCopyList.length > 0) {
        // 이미 존재하는 tobeCodes에서 번역이 필요한 item만 뽑아내기
        const items = tobeCodes
                        .filter((tobeCode) => englishCopyList.some((copyItem) => tobeCode.includes(copyItem)))
                        .map((tobeCode) => ({ id: tobeCode.id, code_context: tobeCode })); // TODO: id 이렇게 넘겨주면 되는건지 다시 확인 
        
        if (items.length > 0) setLocalizationEntries(items);
      }
    } catch (error) {
      console.error("Error uploading translation file:", error);
      alert("번역 업로드에 실패했습니다.");
    }
  };
  const handleTransFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setTransFile(f);
    handleTransSubmit(f);
  };

  return (
    <div className="mt-[100px] mb-[100px] w-full ">
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📤 번역 파일 업로드</h2>
      {!isTemplateCreated ? (
        <p className="font-bold text-[#ff0019] text-[14px] mb-[15px]">⚠️ 템플릿을 생성하거나 불러와야 번역파일을 업로드할 수 있어요.</p>
      ) : !hasOriginalHtmlFile ? (
        <p className="font-bold text-[#ff0019] text-[14px] mb-[15px]">⚠️ 원본코드를 업로드해야 번역파일을 업로드할 수 있어요.</p>
      ) : checkHasInvalidAsWasCount() ? (
        <p className="font-bold text-[#ff0019] text-[14px] mb-[15px]">⚠️ 템플릿 수정이 필요해요.</p>
      ) : (
        <p className="font-bold text-[#00c93c] text-[14px] mb-[15px]">✅ 템플릿을 사용할 수 있어, 번역파일을 업로드할 수 있어요!</p>
      )}
      <div className={`flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] 
         ${!canUploadTransFile ? 'opacity-40 pointer-events-none' : ''}
        `}>
        <div 
          className="flex flex-col justify-center items-center w-[330px] h-[120px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" 
          onClick={canUploadTransFile ? () => transInputRef.current.click() : undefined}
          
        >
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 font-[500] text-[15px]">번역.txt 파일을 업로드 해 주세요</p>
          <input type="file" accept=".txt" ref={transInputRef} onChange={handleTransFileChange} className="hidden" />
          {!!transFile && (
            <div className="mt-2 text-center text-[13px]">
              <p>{transFile.name}</p>
              <p>{formatFileSize(transFile.size)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
