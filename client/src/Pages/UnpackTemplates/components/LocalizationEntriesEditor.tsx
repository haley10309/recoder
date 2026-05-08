import React from "react";

/**
 * 🔹 내부 서브 컴포넌트
 */
const LocalizationEntryItem = ({ entry, index, onDelete }) => {
  return (
    <div className="flex gap-[20px] p-[20px] bg-[#f9f9f9] rounded-[10px] shadow-sm">
      {/* 좌측 */}
      <div className="w-[250px] text-[13px] text-gray-700">
        <p><b>target_selector:</b></p>
        <p className="ml-2">{entry.target}</p>

        <p className="mt-2"><b>apply_type:</b></p>
        <p className="ml-2">{entry.applyType}</p>

        <p className="mt-2"><b>exclude_sup:</b></p>
        <p className="ml-2">{entry.excludeSup ? "O" : "X"}</p>

        <p className="mt-2"><b>enable_text_transform:</b></p>
        <p className="ml-2">{entry.enableTextTransform ? "O" : "X"}</p>

        <button
          onClick={onDelete}
          className="mt-4 px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          세트 삭제
        </button>
      </div>

      {/* 우측 */}
      <div className="flex-1">
        <textarea
          value={entry.copy}
          readOnly
          className="w-full h-[120px] p-[10px] bg-[#e4e4e4] rounded border text-[14px]"
        />
      </div>
    </div>
  );
};

/**
 * 🔹 메인 컴포넌트
 */
const LocalizationEntriesEditor = ({
  localizationEntries,
  onSave,
  onDelete,
}) => {
  return (
    <>
      {/* 리스트 영역 */}
      <div className="flex flex-col gap-[20px]">
        {localizationEntries.length === 0 ? (
          <p className="text-center text-gray-400 mt-[40px]">
            업로드된 데이터가 없습니다.
          </p>
        ) : (
          localizationEntries.map((entry, idx) => (
            <div key={idx}>
              <p className="mb-2 text-sm text-gray-600">
                {idx + 1} of {localizationEntries.length}
              </p>

              <LocalizationEntryItem
                entry={entry}
                index={idx}
                onDelete={() => {
                  if (confirm("정말 삭제하시겠습니까?")) {
                    onDelete(idx);
                  }
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-center mt-[50px]">
        <button
          type="button"
          className="
            bg-black
            text-white
            text-[16px]
            rounded-[10px]
            px-6
            py-2
            transition-colors duration-300
            cursor-pointer
            disabled:bg-gray-300
            disabled:cursor-not-allowed
          "
          onClick={onSave}
          disabled={localizationEntries.length === 0}
        >
          로컬라이제이션 템플릿 저장
        </button>
      </div>
    </>
  );
};

export default LocalizationEntriesEditor;