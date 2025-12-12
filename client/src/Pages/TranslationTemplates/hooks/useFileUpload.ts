import { useState } from "react";

import defaultAxios from "@/apis/defaultAxios";

export const useFileUpload = ({
  codeChanges,
  setEnglishCopyList,
  localizationEntries,
  setLocalizationEntries,
}) => {
  const [translationDeckTxtFile, setTranslationDeckTxtFile] = useState(null);
  
  const _handleTransSubmit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // 1. englishCopyList 받아오고 업데이트
      const res = await defaultAxios.post(
        `/extract-english-copy-list`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const englishCopyList = res.data.englishCopyList;
      setEnglishCopyList(englishCopyList);

      if (localizationEntries.length === 0) {
        // 2. localizationEntries 업데이트 (localizationEntries 없을 때만)
        if (englishCopyList.length > 0) {
          // 이미 존재하는 codeChanges에서 번역이 필요한 item만 뽑아내기
          const items = codeChanges
                          .filter(({ tobe_code }) => englishCopyList.some((copyItem) => tobe_code.includes(copyItem)))
                          .map(({ tobe_code }) => ({ code_context: tobe_code }));
          
          setLocalizationEntries(items)
        }
      }
    } catch (error) {
    }
  };

  const handleTranslationDeckTxtFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTranslationDeckTxtFile(file);
    _handleTransSubmit(file);
  };

  return {
    translationDeckTxtFile,
    handleTranslationDeckTxtFileChange,
  };
};
