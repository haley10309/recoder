import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

// 템플릿 조회
export const templateSearch = async (
  ticket_num,
  ticket_url,
  setTextareas,
  setCodePairs
) => {
  try {
    console.log("📦 보내는 값:", { ticket_num, ticket_url });
    console.log("🌐 BASE_URL:", BASE_URL);

    const response = await axios.post(`${BASE_URL}/template`, {
      ticket_num,
      ticket_url,
    });

    console.log("🔥 응답 결과:", response.data);

    if (response.data.success) {
      alert("성공적으로 템플릿을 불러왔습니다.");
      const pairs = response.data.codePairs;
      const newTextareas = pairs.map((pair) => ({
        asWasCode: pair.aswas_code,
        toBeCode: pair.tobe_code,
        pptNo: pair.ppt_no,
        checked: true,
      }));

      setTextareas(newTextareas);
      setCodePairs(pairs);
    } else {
      console.warn("⚠️ 실패 응답 메시지:", response.data.message);
      alert(
        response.data.message ||
          "유효하지 않은 템플릿입니다.\n정보를 다시 확인해주세요."
      );
    }
  } catch (error) {
    console.error("❌ Error fetching code pairs:", error);
    alert("서버 요청에 실패했습니다. 콘솔을 확인해주세요.");
  }
};

// 실행
export const fileExecute = async ({
  setUploadProgress,
  setIsProcessing,
  handleChangeResults,
  setChangeResults,
  formData,
  updatedTextareas,
  updateTextareasWithResults,
  ticketUrl,
  country_code,
}) => {
  try {
    setIsProcessing(true);

    formData.append("ticket_url", String(ticketUrl));
    formData.append("countryCode", String(country_code));

    const response = await axios.post(`${BASE_URL}/process-file`, formData, {
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

// ToBeApplied - 템플릿 선택지
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

    return response.data.localization_list || [];
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
      `${BASE_URL}/translation_upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { translations, englishCopy, validCountries } = response.data;

    if (!translations || !englishCopy) {
      throw new Error("❌ 번역덱 데이터가 비어 있습니다.");
    }

    return {
      translations,
      englishCopy,
      validCountries,
    };
  } catch (error) {
    console.error("❌ 번역덱 업로드 실패:", error);
    throw error;
  }
};
