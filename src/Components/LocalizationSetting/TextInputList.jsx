// components/TextInputList.jsx
import React from "react";

const TextInputList = ({ inputTexts, onChange, onAddRow, onApply }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="font-semibold mb-4">번역 될 영어 텍스트 입력칸</h2>
      <div className="space-y-3">
        {inputTexts.map((text, index) => (
          <div key={index} className="flex items-center gap-3">
            <span>{index + 1}.</span>
            <input
              type="text"
              value={text}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder="영문 텍스트 입력"
              className="flex-1 border border-gray-300 px-3 py-2 rounded-md shadow-sm"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={onAddRow}
          className="text-blue-600 text-sm hover:underline"
        >
          + 입력칸 추가
        </button>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onApply}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          적용하기
        </button>
      </div>
    </section>
  );
};

export default TextInputList;