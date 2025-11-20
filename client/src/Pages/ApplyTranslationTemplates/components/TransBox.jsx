import React, { useEffect, useRef, useState } from "react";

import "./TransBox.scss";

export default function TransBox({ 
  codeContext: initialCodeContext, 
  highlights = [], 
  onChange, 
}) {
  const editableRef = useRef(null);

  // HTML 특수문자 이스케이프
  const escapeHtml = (str) => {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  // 영어 원본 부분만 빨간색으로 감싸기
  const applyHighlights = () => {
    if (!editableRef.current) return;
    let html = escapeHtml(initialCodeContext);
    highlights.forEach((highlight) => {
      if (!highlight) return;
      const escapedHighlight = escapeHtml(highlight);
      const splited = html.split(escapedHighlight)
      if (splited.length >= 2) {
        html = splited.join(`<span class="text-red-500">${escapedHighlight}</span>`);
      }
    });
    editableRef.current.innerHTML = html;
  };


  // 편집 후 onChange 호출
  const handleBlur = () => {
    const val = editableRef.current.innerText;
    onChange?.(val);
  };

  // 상위에서 텍스트&하이라이트 바뀔 때마다 반영
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = escapeHtml(initialCodeContext);
      applyHighlights();
    }
  }, [initialCodeContext, highlights]);

  return (
    <div className="flex gap-[20px] justify-center bg-[#f9f9f9] rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear">
      {/* 텍스트 입력 및 하이라이트 영역 */}
      <div
        className="w-[100%]" 
      >
        <div className="h-[180px] bg-[#e4e4e4] rounded-[5px] text-[16px] font-[500] whitespace-pre-wrap break-all outline-none border border-[#ccc] focus:border-[#595880] translate-scroll">
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            data-placeholder="TO-BE 텍스트를 입력해 주세요."
          />
        </div>
      </div>
    </div>
  );
}
