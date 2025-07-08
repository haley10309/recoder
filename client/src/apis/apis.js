import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

// 실행
export const convertAsWasToToBeCodes = async ({
  setUploadProgress,
  setIsProcessing,
  handleChangeResults,
  setChangeResults,
  formData,
  updatedTextareas,
  updateTextareasWithResults,
  ticketUrl,
  countryCode,
}) => {
  try {
    setIsProcessing(true);

    formData.append("ticket_url", String(ticketUrl));
    formData.append("countryCode", String(countryCode));

    const response = await axios.post(`${BASE_URL}/convert-aswas-to-tobe-codes`, formData, {
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

    setChangeResults?.(changeResults);
    updateTextareasWithResults?.(updatedTextareas, changeResults);
    handleChangeResults?.(changeResults);

    return { fileContent, filename };
  } catch (error) {
    console.error("Error processing file", error);
  } finally {
    setIsProcessing(false);
  }
};

// TemplateMapping - 템플릿 선택지
export const fetchTicketData = async (_url) => {
  let apiUrl = "";

  if (_url === "get-ticket-number") {
    apiUrl = `${BASE_URL}/get-ticket-number`;
  } else if (_url === "get-ticket-url") {
    apiUrl = `${BASE_URL}/get-ticket-url`;
  } else {
    throw new Error("Invalid URL parameter");
  }

  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// 로컬라이제이션 템플릿 가져오기
export const fetchLocalizationList = async (ticket_num, ticket_url) => {
  try {
    const response = await axios.post(`${BASE_URL}/get-template-details`, {
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
    const response = await axios.post(
      `${BASE_URL}/upload-translation`,
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
