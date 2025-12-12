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
    console.error("Error processing file", error);
  } finally {
    setIsProcessing(false);
  }
};

// Template의 티켓번호, 티켓Url 가져오기
export const fetchTemplates = async () => {
  try {
    const response = await defaultAxios.get(`/get-templates`);
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

// 로컬라이제이션 템플릿 가져오기
export const fetchLocalizationList = async (ticket_num, ticket_url) => {
  try {
    const response = await defaultAxios.post(`/get-template-details`, {
      ticket_num,
      ticket_url,
    });

    return response.data.localizationEntries || [];
  } catch (error) {
    console.error("로컬라이제이션 API 호출 실패:", error);
    throw error;
  }
};

export const uploadTranslationDeck = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await defaultAxios.post(
      `/upload-translation`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { translations, englishCopyList, validCountries } = response.data;

    if (!translations || !englishCopyList) {
      throw new Error("❌ 번역덱 데이터가 비어 있습니다.");
    }

    return {
      translations,
      englishCopyList,
      validCountries,
    };
  } catch (error) {
    console.error("❌ 번역덱 업로드 실패:", error);
    throw error;
  }
};
