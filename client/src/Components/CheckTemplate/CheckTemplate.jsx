import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import InputDrop from "../Common/InputDrop";
import { isAssetCode } from "@/utils/codeUtils";

/**
 * path: 'edit-template' | 'edit-localization-entries' // 페이지 종류에 따라 템플릿 불러오기에 따른 동작이 다름
 */
const CheckTemplate = ({
  path,
  setSaveType, 
  setIsTemplateCreated,
  setTemplateID, 
  ticketNum, 
  ticketURL, 
  setTicketNum, 
  setTicketURL, 
  setLocalizationEntries, 
  setDeleteIds, 
  setAssetCodeChanges, 
  setNonAssetCodeChanges, 
}) => {
  const checkForExistingTemplate = async () => {
    try {
      // 1) 템플릿 존재 여부 확인
      const response = await axios.post(`${BASE_URL}/check-template-exsist`, {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
      });
      const data = response.data;

      const isTemplateExist = data.isTemplateExist;
      if (isTemplateExist) {
        alert(`${ticketURL} 템플릿을 불러왔습니다.`);
        setSaveType("update");
        setIsTemplateCreated(true);

        // 2) 세부 내용 가져오기
        const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketURL,
        });
        const detailData = detailRes.data;

        const templateId = detailData.templateId;
        const codeChanges = detailData.codeChanges || [];
        const localizationEntries = detailData.localizationEntries || []; // TODO: 이것도 콘솔 찍어서 확인하기. id 제대로 오는지.

        // (250519 기준) aswas_code 기준으로 asset인지 non-asset인지 나눈다.
        const nonAssetCodeChanges = codeChanges
                                      .filter((it) => !isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );
        const assetCodeChanges = codeChanges
                                      .filter((it) => isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );

        setNonAssetCodeChanges(nonAssetCodeChanges);
        setAssetCodeChanges(assetCodeChanges);
        
        // 템플릿 AS-WAS/TO-BE, 로컬라이제이션 세팅
        setTemplateID(templateId);
        setDeleteIds([]);

        setLocalizationEntries(
          localizationEntries.map((it) => ({
            id: it.id,
            code_context: it.code_context,
          }))
        );

      } else {
        setSaveType("create");
        setIsTemplateCreated(false);
        setLocalizationEntries([{ code_context: "" }]);
        setDeleteIds([]);
        
        if (path === 'edit-template') {
          alert("새로운 템플릿을 추가할 수 있습니다.");
        }
        if (path === 'edit-localization-entries') {
          alert("Edit Template 페이지에서 먼저 템플릿을 생성해주세요.");
        }
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
      setIsTemplateCreated(false);
      setDeleteIds([]);
    }
  };

  return (
    <>
      <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
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
