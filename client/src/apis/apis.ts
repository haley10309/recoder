import defaultAxios from "./defaultAxios";

// 실행
export const convertAsWasToToBeCodes = async ({
  formData,
  setIsProcessing,
  setUploadProgress,
}) => {
  try {
    setIsProcessing(true);

    const response = await defaultAxios.post(`/convert-aswas-to-tobe-codes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "json",
      onUploadProgress: (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(percent);
      },
    });

    const { changeResults, filename, fileContent } = response.data;

    return { fileContent, filename, changeResults };
  } catch (error) {
  } finally {
    setIsProcessing(false);
  }
};

// Template의 티켓번호, 티켓Url 가져오기
export const fetchTemplates = async () => {
  const response = await defaultAxios.get(`/get-templates`);
  return response.data;
};

export const parseTranslationFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await defaultAxios.post(
    `/parse-translation-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const { translations, englishCopyList, validCountries } = response.data;

  if (!translations || !englishCopyList) {
    alert("❌ 번역덱 데이터가 비어 있습니다.");
    throw new Error("❌ 번역덱 데이터가 비어 있습니다.");
  }

  return {
    translations,
    englishCopyList,
    validCountries,
  };
};

export const parseExcelFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await defaultAxios.post(
    "/unpack-templates/extract", 
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data?.row_list || [];
};
