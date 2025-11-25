import { useRef } from "react";

import arrowIcon from "@/assets/shift-fill.svg";
import { formatFileSize } from "@/utils/codeUtils";

export default function TransFileUpload({ 
  transFile,
  handleTransFileChange,
}) {
  const transInputRef = useRef(null);

  return (
    
    <div className="w-full ">
      <div className={`flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]`}>
        <div 
          className="flex flex-col justify-center items-center w-[330px] h-[120px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" 
          onClick={() => transInputRef.current.click()}
          
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
