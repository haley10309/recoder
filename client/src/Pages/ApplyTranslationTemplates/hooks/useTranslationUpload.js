import { useState } from "react";
import { uploadTranslationDeck } from "@/apis/apis";

export function useTranslationUpload(countryCode) {
  const [translationsByCountry, setTranslationsByCountry] = useState({});
  const [translationMap, setTranslationMap] = useState({}); // 원본 영어 카피와 국가별 번역값을 매핑
  const [validCountries, setValidCountries] = useState([]);
  const [txtUploadStatus, setTxtUploadStatus] = useState("");
  const [txtFileName, setTxtFileName] = useState("");
  const [txtUploadProgress, setTxtUploadProgress] = useState(0);
  const [copyDeckFile, setCopyDeckFile] = useState(null);

  const handleTranslationTxtUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setTxtUploadStatus("fail");
      return;
    }

    const reader = new FileReader();

    // 파일 읽기 시작할 때
    reader.onloadstart = () => {
      setTxtUploadProgress(0);
    };

    // 파일 읽는 중
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setTxtUploadProgress(percent);
      }
    };

    // 파일 다 읽었을 때
    reader.onload = async () => {
      setTxtUploadProgress(100);

      try {
        setCopyDeckFile(file);

        const { translations, englishCopyList, validCountries } =
          await uploadTranslationDeck(file);

        setValidCountries(validCountries);
        setTranslationsByCountry(translations);

        const currentCountry = countryCode;
        const countryTranslations = translations[currentCountry] || [];

        const _translationMap = {};
        for (let i = 0; i < englishCopyList.length; i++) {
          const key = englishCopyList[i]?.trim();
          const value = countryTranslations[i]?.trim();
          if (value && key !== value) {
            _translationMap[key] = value;
          }
        }

        setTranslationMap(_translationMap);
        setTxtUploadStatus("success");
        setTxtFileName(file.name);
      } catch (err) {
        console.error(err);
        setTxtUploadStatus("fail");
      }
    };

    // 에러 났을 때
    reader.onerror = () => {
      setTxtUploadStatus("fail");
    };

    reader.readAsText(file);
  };

  return {
    translationsByCountry,
    translationMap,
    validCountries,
    txtUploadStatus,
    txtFileName,
    handleTranslationTxtUpload,
    copyDeckFile,
  };
}
