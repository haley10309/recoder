import React from "react";
import AddIcon from "@mui/icons-material/Add";

import TransBox from "./TransBox";

const LocalizationEntriesEditor = ({
  saveType,
  canUploadTransFile,
  highlights,
  localizationEntries,
  setLocalizationEntries,
  handleCreateOrUpdateLocalization,
  setDeleteIds,
}) => {
  return (
    // TODO: 빨간색 표시 몇개인지도 알려주기?
    <>
      <div className="flex flex-col">
        {localizationEntries.map((item, idx) => (
          <TransBox
            key={idx}
            indexText={`${idx + 1} of ${localizationEntries.length}`}
            itemId={item.id}
            codeContext={item.code_context}
            highlights={highlights}
            onChange={(newTxt) => {
              setLocalizationEntries((prev) => {
                const a = [...prev];
                a[idx].code_context = newTxt;
                return a;
              });
            }}
            onDelete={() => handleDeleteLocalizationEntry(item.id, idx)}
          />
        ))}
      </div>
      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button
          className="plus-button rounded-[10px]"
          onClick={ () => setLocalizationEntries((prev) => [...prev, { code_context: "" }])}
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