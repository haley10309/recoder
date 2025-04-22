import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import InputDrop from "../../Components/Common/InputDrop";

const CheckTemplate = ({ setSave_type, setAsWasCodes, setToBeCodes, setAsset_asWas, setAsset_toBe, setTemplateID, setPptNos, setAsset_pptNo, ticketNum, ticketURL, setTicketNum, setTicketURL }) => {
  const handleTicketNumChange = (ticketNum) => {
    setTicketNum(ticketNum);
  };

  const handleTicketURLChange = (ticketURL) => {
    setTicketURL(ticketURL);
  };

  const checkForExistingTemplate = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/check-template`, {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
      });

      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const { id } = data[0];
        if (id > 0) {
          alert("이미 존재하는 템플릿이 있습니다.");
          setSave_type("update");
        }

        const detailResponse = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketURL,
        });

        const templateId = detailResponse.data?.templateId;
        setTemplateID(templateId);

        // Extract the aswas_tobe_list array from response
        const details = detailResponse.data?.aswas_tobe_list || [];

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
        setAsWasCodes((prev) => [...prev, ...details.filter((item) => !item.aswas_code?.trim().startsWith("//")).map((item) => item.aswas_code?.trim() || "")]);
        setToBeCodes((prev) => [...prev, ...details.filter((item) => !item.tobe_code?.trim().startsWith("//")).map((item) => item.tobe_code?.trim() || "")]);

        setAsset_asWas((prev) => [...prev, ...details.filter((item) => item.aswas_code?.trim().startsWith("//")).map((item) => item.aswas_code?.trim() || "")]);
        setAsset_pptNo((prev) => [...prev, ...details.filter((item) => item.aswas_code?.trim().startsWith("//")).map((item) => item.ppt_no || "")]);
        setAsset_toBe((prev) => [...prev, ...details.filter((item) => item.tobe_code?.trim().startsWith("//")).map((item) => item.tobe_code?.trim() || "")]);
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
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📄 핫픽스 템플릿 생성</h2>
      <div className="flex items-center bg-[#F9F9F9] rounded-[10px] p-6 min-h-[150px] justify-between">
        <div className="flex">
          <InputDrop _wrapperProps={{ className: "w-[260px]" }} _title="지라 티켓 번호" _value={ticketNum} _setValue={setTicketNum} _url="get-ticket-number" />
          <InputDrop _wrapperProps={{ className: "w-[400px] mx-auto" }} _title="URL" _value={ticketURL} _setValue={setTicketURL} _url="get-ticket-url" />
        </div>
        <button className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px]" onClick={checkForExistingTemplate}>
          확인
        </button>
      </div>
    </>
  );
};

export default CheckTemplate;
