import React from "react";
import AddIcon from "@mui/icons-material/Add";

import TransBox from "@/Components/Common/TransBox";

const LocalizationEntriesEditor = ({
  saveType,
  canUploadTransFile,
  englishCopyList,
  localizationEntries,
  setLocalizationEntries,
  handleCreateOrUpdateLocalization,
  setDeleteIds,
}) => {
  return (
    <>
      <div className="flex flex-col">
        {localizationEntries.map((item, idx) => (
          <TransBox
            key={idx}
            itemId={item.id}
            text={item.code_context}
            highlights={englishCopyList}
            onChange={(newTxt) => {
              setLocalizationEntries((prev) => {
                const a = [...prev];
                a[idx].code_context = newTxt;
                return a;
              });
            }}
            onDelete={() => {
              // TODO: id 활용 부분 전부 다시 체크
              setLocalizationEntries((prev) => prev.filter((_, i) => i !== idx));
              if (item.id) setDeleteIds((prev) => [...prev, item.id]);
            }}
          />
        ))}
      </div>
      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button
          className="plus-button rounded-[10px]"
          onClick={() => setLocalizationEntries((prev) => [...prev, { code_context: "" }])}
        >
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button 
          type="button" 
          className="save_button" 
          onClick={handleCreateOrUpdateLocalization} 
          disabled={!canUploadTransFile}
        >
          {saveType === "update" ? ` 로컬라이제이션 템플릿 수정` : ` 로컬라이제이션 템플릿 생성`}
        </button>
      </div>
    </>
  );
};

export default LocalizationEntriesEditor;