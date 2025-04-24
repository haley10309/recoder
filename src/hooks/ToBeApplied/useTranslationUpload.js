// 번역덱(txt 파일)을 파싱하여 국가별 번역 딕셔너리를 생성하고 상태로 관리
import { useState } from "react";
import { uploadTranslationDeck } from "@/apis/apis";

export const useTranslationUpload = (country_code) => {
  const [currentTranslations, setCurrentTranslations] = useState({});
  const [translationsByCountry, setTranslationsByCountry] = useState({});
  const [validCountries, setValidCountries] = useState([]);

  const handleUpload = async (file) => {
    try {
      const { translations, englishCopy, validCountries } =
        await uploadTranslationDeck(file);

      const currentCountry = country_code;
      const countryTranslations = translations[currentCountry] || [];

      const dictionary = {};
      englishCopy.forEach((eng, i) => {
        const key = eng?.trim();
        const val = countryTranslations[i]?.trim();
        if (val && key !== val) {
          dictionary[key] = val;
        }
      });

      setValidCountries(validCountries);
      setTranslationsByCountry(translations);
      setCurrentTranslations(dictionary);

      console.log("🌍 현재 country_code:", currentCountry);
      console.log("📘 dictionary:", Object.entries(dictionary).slice(0, 5));
    } catch (err) {
      console.error("🚨 업로드 실패:", err);
    }
  };

  return {
    handleUpload,
    currentTranslations,
    translationsByCountry,
    validCountries,
  };
};
