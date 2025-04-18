import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

  // 템플릿 조회
  export const templateSearch = async (ticket_num, ticket_url, setTextareas, setCodePairs) => {
    try {
        const response = await axios.post(
          `${BASE_URL}/template`,
          {
            ticket_num: ticket_num,
            ticket_url: ticket_url,
          }
        );
  
        if (response.data.success) {
          alert("성공적으로 템플릿을 불러왔습니다.");
          const pairs = response.data.codePairs;
          const newTextareas = pairs.map((pair) => ({
            asWasCode: pair.aswas_code,
            toBeCode: pair.tobe_code,
            checked:true
          }));
  
          setTextareas(newTextareas);
          setCodePairs(pairs);
        } else {
          alert("유효하지 않은 템플릿입니다.\n정보를 다시 확인해주세요.");
        }
      } catch (error) {
        console.error("Error fetching code pairs:", error);
      }
  };


  // 실행
  export const fileExecute = async (setChangeResults, handleChangeResults, setIsProcessing, formData, updatedTextareas, updateTextareasWithResults, productName, country_code) => {
    try {
      setIsProcessing(true);

      formData.append("productName", String(productName));
      formData.append("countryCode", String(country_code));
      const response = await axios.post(`${BASE_URL}/process-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'json'
      });

      const { changeResults, filename, fileContent } = response.data;

      setChangeResults(changeResults);
      updateTextareasWithResults(updatedTextareas, changeResults);
      handleChangeResults(changeResults);
      
      return { fileContent, filename }; 

    } catch (error) {
      console.error("Error processing file", error);
    } finally {
      setIsProcessing(false);
    }
  };


  // ToBeApplied - 템플릿 선택지
  export const templateOption = async (_url) => {
    let apiUrl = '';

    if (_url === "get-ticket-number") {
      apiUrl = `${BASE_URL}/get-ticket-number`;
    } else if (_url === "get-ticket-url") {
      apiUrl = `${BASE_URL}/get-ticket-url`;
    } else {
      throw new Error('Invalid URL parameter');
    }
  
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }