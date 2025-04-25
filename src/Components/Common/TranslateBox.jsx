import React, { useEffect, useRef } from "react";
import deleteIcon from "@/assets/icon/delete-icon.svg";

export default function TranslateBox({ text: initialText, highlights = [], onChange, onDelete }) {
  const editableRef = useRef(null);

  // 초기 텍스트와 강조 표시 적용
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = escapeHtml(initialText);
      applyHighlights();
    }
  }, [initialText, highlights]);

  // highlights 배열에 포함된 부분만 <span class="text-red-500">로 감싸 강조
  const applyHighlights = () => {
    if (!editableRef.current) return;
    let html = escapeHtml(initialText);
    highlights.forEach((substr) => {
      const safe = escapeHtml(substr);
      html = html.split(safe).join(`<span class=\"text-red-500\">${safe}</span>`);
    });
    editableRef.current.innerHTML = html;
  };

  const handleBlur = () => {
    const newText = editableRef.current.innerText;
    if (onChange) onChange(newText);
  };

  return (
    <div className="flex w-[full] bg-[#F9F9F9] rounded-[10px] px-20 py-5 items-center">
      <div ref={editableRef} contentEditable suppressContentEditableWarning onBlur={handleBlur} className="flex-1 p-4 h-[140px] bg-[#D9D9D9] rounded-[10px] text-[14px] font-[500] whitespace-pre-wrap break-all overflow-auto outline-none focus:border-black" />
      <button onClick={onDelete} className="ml-10 flex-shrink-0">
        <img src={deleteIcon} alt="삭제" className="w-[24px] h-[24px]" />
      </button>
    </div>
  );
}

// HTML escape helper
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
