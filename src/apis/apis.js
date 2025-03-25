import axios from "axios";
import { BASE_URL } from "../utils/routePath";
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
export const fileExecute = async (setChangeResults, setDownloadLink, handleChangeResults, setIsProcessing, formData, updatedTextareas, updateTextareasWithResults) => {
    try {
        setIsProcessing(true);
        const response = await axios.post(`${BASE_URL}/api/process-file`, formData);
        const { downloadLink, changeResults } = response.data;
    
        setChangeResults(changeResults);
        updateTextareasWithResults(updatedTextareas, changeResults);
        handleChangeResults(changeResults)
        
        if (downloadLink) {
          setDownloadLink(downloadLink);
        }
      } catch (error) {
        console.error("Error processing file", error);
      } finally {
        setIsProcessing(false);
      }
    };


  // 파일 다운로드
  export const processFileForDownload = async (formData) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/process-file`, formData);
      const { downloadLink, changeResults } = response.data;
  
      return { downloadLink, changeResults };
    } catch (error) {
      console.error("Error processing file", error);
      throw error;
    }
  };
  
  // 파일 로컬 다운로드
  export const downloadFile = async (downloadLink, country_code, productName) => {
    try {
      const downloadResponse = await axios.get(downloadLink, { responseType: "text" });
  
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement("a");
      link.href = url;
  
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "").slice(2);
      const formattedCountryCode = country_code.replace(/\s+/g, "_");
      const filename = `${productName}_${formattedCountryCode}_to-be_${formattedDate}.html`;
  
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file", error);
      throw error; 
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