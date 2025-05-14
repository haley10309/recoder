import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import InputDrop from "../Common/InputDrop";
import { isAssetCode } from "@/utils/codeUtils";

/**
 * path: 'create-template' | 'localize-template' // 페이지 종류에 따라 템플릿 불러오기에 따른 동작이 다름
 */
const CheckTemplate = ({
  path,
  setSaveType, 
  setIsTemplateCreated,
  setNonAssetPptNos, 
  setNonAssetAsWasCodes, 
  setNonAssetToBeCodes, 
  setAssetPptNos, 
  setAssetAsWasCodes, 
  setAssetToBeCodes, 
  setTemplateID, 
  ticketNum, 
  ticketURL, 
  setTicketNum, 
  setTicketURL, 
  setLocalizedItems, 
  setDeleteIds, 
}) => {
  const checkForExistingTemplate = async () => {
    try {
      // 1) 핫픽스 템플릿 존재 여부 확인
      const response = await axios.post(`${BASE_URL}/check-template`, {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
      });
      const data = response.data;
      const isTemplateExist = Array.isArray(data) && data.length > 0 && data[0].id > 0;

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
        const aswasTobeList = detailData.aswas_tobe_list || [];
        const localizationList = detailData.localization_list || []; // TODO: CreateTemplate에서는 필요없음음

        const nonAssetAswasList = aswasTobeList.filter((it) => !isAssetCode(it.aswas_code));
        const nonAssetTobeList = aswasTobeList.filter((it) => !isAssetCode(it.tobe_code));
        const assetAswasList = aswasTobeList.filter((it) => isAssetCode(it.aswas_code));
        const assetTobeList = aswasTobeList.filter((it) => isAssetCode(it.tobe_code));
        
        // 핫픽스 AS-WAS/TO-BE, 로컬라이제이션 세팅
        setTemplateID(templateId);
        setDeleteIds([]);

        setNonAssetPptNos(nonAssetAswasList.map((it) => it.ppt_no || "")); // 특이사항(250509): nonAsset pptNos만 원본 aswasTobeList를 사용하고 있었는데, 실수로 판단되어 nonAssetAswasList로 수정함함
        setNonAssetAsWasCodes(nonAssetAswasList.map((it) => it.aswas_code?.trim() || ""));
        setNonAssetToBeCodes(nonAssetTobeList.map((it) => it.tobe_code?.trim() || ""));

        setAssetPptNos(assetAswasList.map((it) => it.ppt_no || ""));
        setAssetAsWasCodes(assetAswasList.map((it) => it.aswas_code?.trim() || ""));
        setAssetToBeCodes(assetTobeList.map((it) => it.tobe_code?.trim() || ""));

        setLocalizedItems(
          localizationList.map((it) => ({
            id: it.id,
            local_code: it.local_code,
          }))
        );
      } else {
        setSaveType("create");
        setIsTemplateCreated(false);
        setLocalizedItems([{ local_code: "" }]);
        setDeleteIds([]);
        
        if (path === 'create-template') {
          alert("새로운 템플릿을 추가할 수 있습니다.");
        }
        if (path === 'localize-template') {
          alert("Create/Update Template 페이지에서 먼저 템플릿을 생성해주세요.");
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
