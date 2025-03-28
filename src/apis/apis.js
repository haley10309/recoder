import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

// 템플릿 조회
export const templateSearch = async (projectName, pdp, productName, setTextareas, setCodePairs) => {
    try {
        const response = await axios.post(
          `${BASE_URL}/template`,
          {
            hotfix_name: projectName,
            pdp_name: pdp,
            product: productName,
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

    const blob = new Blob([fileContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error("Error processing file", error);
  } finally {
    setIsProcessing(false);
  }
};


  // ToBeApplied - 템플릿 선택지
  export const templateOption = async (_url) => {
    let apiUrl = '';

    if (_url === "projects") {
      apiUrl = `${BASE_URL}/projects`;
    } else if (_url === "pdps") {
      apiUrl = `${BASE_URL}/pdps`;
    } else if (_url === "products") {
      apiUrl = `${BASE_URL}/products`;
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