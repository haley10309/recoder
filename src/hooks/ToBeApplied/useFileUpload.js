import { useState } from "react";
import { uploadTranslationDeck } from "@/apis/apis";

export const useFileUpload = ({
  setTranslationFile,
  setTxtUploadStatus,
  setTxtFileName,
  setTranslationsByCountry,
  setCurrentTranslations,
  setValidCountries,
  country_code,
}) => {
  const handleTranslationUpload = async (e) => {
    const file = e.target.files[0];
    setTranslationFile(file);
    if (!file) {
      setTxtUploadStatus("fail");
      return;
    }

    try {
      const { translations, englishCopy, validCountries } =
        await uploadTranslationDeck(file);

      setValidCountries(validCountries);
      setTranslationsByCountry(translations);

      const currentCountry = country_code;
      const countryTranslations = translations[currentCountry] || [];

      const dictionary = {};
      for (let i = 0; i < englishCopy.length; i++) {
        const key = englishCopy[i]?.trim();
        const value = countryTranslations[i]?.trim();
        if (value && key !== value) {
          dictionary[key] = value;
        }
      }

      setCurrentTranslations(dictionary);
      setTxtUploadStatus("success");
      setTxtFileName(file.name);
    } catch (err) {
      console.error(err);
      setTxtUploadStatus("fail");
    }
  };

  return { handleTranslationUpload };
};
