import axios from "axios";
import BasicInput from "@/Components/Template_detail_set/Input";
import { BASE_URL } from "@/utils/routePath";

const CheckTemplate = ({setSave_type, setAsWasCodes, setToBeCodes, setAsset_asWas, setAsset_toBe,setTemplateID, setPptNos, setAsset_pptNo, ticketNum, ticketURL, setTicketNum, setTicketURL }) => {
    
  const handleTicketNumChange = (ticketNum) => {
    setTicketNum(ticketNum);
  };

  const handleTicketURLChange = (ticketURL) => {
    setTicketURL(ticketURL);
  };

  const checkForExistingTemplate = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/check-template`, {
          ticketNum,
          ticketURL,
        });
    
        if (response.data.length > 0) {
          alert("이미 존재하는 템플릿이 있습니다.");
          setSave_type("update");
    
          const detailsResponse = await axios.post(`${BASE_URL}/get-template-details`, {
            ticketNum,
            ticketURL,
          });
    
          // console.log("Server Response:", detailsResponse.data);
          const templateId = detailsResponse.data?.templateId;
          setTemplateID(templateId);
    
          // Extract the aswas_tobe_list array from response
          const details = detailsResponse.data?.aswas_tobe_list || [];
    
          if (!Array.isArray(details)) {
            throw new Error("Invalid data format: Expected an array but got " + typeof details);
          }
    
          // Reset states before updating
          setPptNos([]);
          setAsWasCodes([]);
          setToBeCodes([]);
          setAsset_asWas([]);
          setAsset_toBe([]);
          setAsset_pptNo([]);
    
          // Process response data
          setPptNos((prev) => [...prev, ...details.map((item) => item.ppt_no || "")]);
          setAsWasCodes((prev) => [
            ...prev,
            ...details.filter((item) => !(item.aswas_code?.trim().startsWith("//"))).map((item) => item.aswas_code?.trim() || ""),
          ]);
          setToBeCodes((prev) => [
            ...prev,
            ...details.filter((item) => !(item.tobe_code?.trim().startsWith("//"))).map((item) => item.tobe_code?.trim() || ""),
          ]);
    
          setAsset_asWas((prev) => [
            ...prev,
            ...details.filter((item) => item.aswas_code?.trim().startsWith("//")).map((item) => item.aswas_code?.trim() || ""),
          ]);
          setAsset_pptNo((prev) => [
            ...prev,
            ...details.filter((item) => item.aswas_code?.trim().startsWith("//")).map((item) => item.ppt_no || ""),
          ]);
          setAsset_toBe((prev) => [
            ...prev,
            ...details.filter((item) => item.tobe_code?.trim().startsWith("//")).map((item) => item.tobe_code?.trim() || ""),
          ]);
          
        } else {
          alert("새로운 템플릿을 추가할 수 있습니다.");
          setSave_type("create");
        }
      } catch (error) {
        console.error("Error checking for existing templates:", error);
        alert("템플릿 확인 중 오류가 발생했습니다.");
      }
    };

  return (
    <>
      <div className="flex flex-col p-8 bg-white rounded-[10px] border border-gray-300 text-[#32383E]">
        <h2 className="font-bold text-black mb-5 text-[16px]">템플릿 확인하기</h2>
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center px-2 overflow-x-auto">
            <BasicInput
              _inputProps={{ placeholder: "WSC20200078-9816" }}
              _title="Jira 티켓 번호"
              _onChange={handleTicketNumChange}
              _value={ticketNum}
            />
            <BasicInput
              _inputProps={{ placeholder: "/smartphones/galaxy-s24-ultra/compare/" }}
              _title="Page URL"
              _onChange={handleTicketURLChange}
              _value={ticketURL}
            />
            </div>
            <div className="flex justify-center">
              <button
                className="flex justify-center items-center bg-[#009900] text-white font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]"
                onClick={checkForExistingTemplate}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckTemplate;