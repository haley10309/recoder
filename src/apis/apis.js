import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
// console.log("베이스", BASE_URL)

// 템플릿 조회
export const templateSearch = async (projectName, pdp, productName, setTextareas, setCodePairs) => {
    try {
        const response = await axios.post(
          `${BASE_URL}/api/search-setting`,
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
        //   console.log("Code pairs:", pairs);
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

    // console.log("productName", productName);
    // console.log("countryCode", country_code);

    const response = await axios.post(`${BASE_URL}/api/process-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'json'
    });

    console.log(response.data);

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
  export const templateOption = async (_url, setOptions, setLoading) => {
    try {
        const response = await axios.get(`${BASE_URL}/${_url}`);
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching product names:", error);
      } finally {
        setLoading(false);
      }
  }