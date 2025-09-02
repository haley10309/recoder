import React, { useEffect, useRef, useState } from "react";
import "./TransBox.scss";

export default function TransBox({ 
  codeContext: initialCodeContext,
  highlights = [],
  onChange,
  borderColor,
}) {
  const editableRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // TODO: 빨간색으로 감싸는 부분에서 보완할 부분은 없는지 후순위로 체크
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
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
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
      <div 
        className={`h-[180px] bg-[#e4e4e4] rounded-[5px] text-[16px] font-[500] whitespace-pre-wrap break-all outline-none border border-[#ccc] focus:border-[#595880] translate-scroll`}
        style={{
          borderColor,
          borderWidth: 2,
        }}
      >
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onFocus={handleFocus}
          data-placeholder="번역할 텍스트를 입력해 주세요."
        />
      </div>

      {isFocused ? (
        <div style={{ fontSize: "10px", color: "#fa5780" }}>* 입력 후 다른 영역을 클릭하면 텍스트가 저장됩니다</div>
      ) : null}
    </>
  );
}

// HTML 특수문자 이스케이프
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
