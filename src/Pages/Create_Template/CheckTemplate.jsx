import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import InputDrop from "../../Components/Common/InputDrop";

const CheckTemplate = ({ setSave_type, setAsWasCodes, setToBeCodes, setAsset_asWas, setAsset_toBe, setTemplateID, setPptNos, setAsset_pptNo, ticketNum, ticketURL, setTicketNum, setTicketURL, setLocalizedItems }) => {
  const checkForExistingTemplate = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/check-template`, {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
      });

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        // 기존 as-was / to-be 처리
        const { id } = data[0];
        if (id > 0) {
          alert(`${ticketURL} 템플릿을 불러왔습니다.`);
          setSave_type("update");
        }

        // 상세 조회 (aswas_tobe_list + localization_list + delete_ids)
        const detailResponse = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketURL,
        });

        const detailData = detailResponse.data;
        setTemplateID(detailData.templateId);

        /** 1) AS-WAS / TO-BE 세팅 **/
        const details = detailData.aswas_tobe_list || [];
        setPptNos(details.map((item) => item.ppt_no || ""));
        setAsWasCodes(details.filter((i) => !i.aswas_code?.trim().startsWith("//")).map((i) => i.aswas_code?.trim() || ""));
        setToBeCodes(details.filter((i) => !i.tobe_code?.trim().startsWith("//")).map((i) => i.tobe_code?.trim() || ""));
        setAsset_asWas(details.filter((i) => i.aswas_code?.trim().startsWith("//")).map((i) => i.aswas_code?.trim()));
        setAsset_pptNo(details.filter((i) => i.aswas_code?.trim().startsWith("//")).map((i) => i.ppt_no || ""));
        setAsset_toBe(details.filter((i) => i.tobe_code?.trim().startsWith("//")).map((i) => i.tobe_code?.trim()));

        /** 2) Localization(번역) 세팅 **/
        const locList = detailData.localization_list || [];
        setLocalizedItems(
          locList.map((item) => ({
            id: item.id,
            local_code: item.local_code,
          }))
        );
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
