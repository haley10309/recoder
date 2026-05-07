import { useRef } from "react";

import arrowIcon from "@/assets/shift-fill.svg";
import { formatFileSize } from "@/utils/codeUtils";

export default function ExcelFileUpload({
  excelFile,
  handleExcelFileChange,
}) {
  const inputRef = useRef(null);

  return (
    <div className="w-full">
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        
        <div
          className="flex flex-col justify-center items-center w-[330px] h-[140px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer hover:bg-[#f1f1f1] transition"
          onClick={() => inputRef.current.click()}
        >
          {/* 아이콘 */}
          <img
            src={arrowIcon}
            alt="upload arrow"
            className="w-8 h-8 text-gray-500"
          />

          {/* 안내 텍스트 */}
          <p className="mt-3 font-[500] text-[15px]">
            엑셀 파일을 업로드 해 주세요
          </p>
          <p className="text-[12px] text-gray-500">
            (.xlsx, .xls)
          </p>

          {/* 숨겨진 input */}
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={inputRef}
            onChange={handleExcelFileChange}
            className="hidden"
          />

          {/* 파일 정보 표시 */}
          {!!excelFile && (
            <div className="mt-3 text-center text-[13px]">
              <p className="font-[500] truncate max-w-[250px]">
                {excelFile.name}
              </p>
              <p className="text-gray-500">
                {formatFileSize(excelFile.size)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}