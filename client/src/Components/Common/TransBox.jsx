import React, { useEffect, useRef } from "react";
import "@Components/Common/TransBox.scss";
import CopyTextButton from "./CopyTextButton";
import Gap from "./Gap";

export default function TransBox({ 
  itemId,
  indexText,
  codeContext: initialCodeContext, 
  highlights = [], 
  onChange, 
  onDelete,
}) {
  const editableRef = useRef(null);

  // 영어 원본 부분만 빨간색으로 감싸기
  const applyHighlights = () => {
    if (!editableRef.current) return;
    let html = escapeHtml(initialCodeContext);
    highlights.forEach((substr) => {
      const safe = escapeHtml(substr);
      html = html.split(safe).join(`<span class="text-red-500">${safe}</span>`);
    });
    editableRef.current.innerHTML = html;
  };

  // 편집 후 onChange 호출
  const handleBlur = () => {
    const newText = editableRef.current.innerText;
    onChange?.(newText);
  };

  // 초기 텍스트 반영 & 하이라이트
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = escapeHtml(initialCodeContext);
      applyHighlights();
    }
  }, [initialCodeContext, highlights]);

  return (
    <>
      <div style={{ fontSize: "12px" }}>{indexText}</div>
    
      <div className="flex gap-[20px] justify-center mb-4 p-[30px] bg-[#f9f9f9] rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear">
        {/* 텍스트 입력 및 하이라이트 영역 */}
        <div style={{ fontSize: "12px" }}>LocalizationEntry.id: {itemId ? itemId : "-"}</div>
        <div
          className="p-[8px] w-[80%]" 
        >
          <div className="h-[180px] bg-[#e4e4e4] rounded-[5px] text-[16px] font-[500] whitespace-pre-wrap break-all outline-none border border-[#ccc] focus:border-[#595880] translate-scroll">
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleBlur}
              data-placeholder="번역할 텍스트를 입력해 주세요."
            />
          </div>
          <Gap gap={10} />
          <CopyTextButton
            text={"코드 복사"}
            value={initialCodeContext}
          />
        </div>
        <button 
          type="button"
          onClick={onDelete}
          className="px-4 transition-colors duration-300 border border-gray-300 rounded cursor-pointer hover:bg-red-500 hover:text-white"
        >
          삭제
        </button>
      </div>
    </>
  );
}

// HTML 특수문자 이스케이프
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
