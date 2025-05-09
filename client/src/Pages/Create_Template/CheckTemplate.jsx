import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import InputDrop from "../../Components/Common/InputDrop";
import { isAssetCode } from "@/utils/codeUtils";

const CheckTemplate = ({ 
  setSaveType, 
  setIsTemplateCreated,
  setNonAssetAsWasCodes, 
  setToBeCodes, 
  setAsset_asWas, 
  setAsset_toBe, 
  setTemplateID, 
  setPptNos, 
  setAsset_pptNo, 
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
      const isExist = Array.isArray(data) && data.length > 0 && data[0].id > 0;

      if (isExist) {
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
        const localizationList = detailData.localization_list || [];

        const nonAssetAswasList = aswasTobeList.filter((it) => !isAssetCode(it.aswas_code));
        const assetAswasList = aswasTobeList.filter((it) => isAssetCode(it.aswas_code));
        const nonAssetTobeList = aswasTobeList.filter((it) => !isAssetCode(it.tobe_code));
        const assetTobeList = aswasTobeList.filter((it) => isAssetCode(it.tobe_code));
        
        // console.log('====')
        // console.log('aswasTobeList',aswasTobeList)
        // console.log('localizationList',localizationList)

        // 핫픽스 AS-WAS/TO-BE, 로컬라이제이션 세팅
        setTemplateID(templateId);
        setPptNos(aswasTobeList.map((it) => it.ppt_no || ""));
        setNonAssetAsWasCodes(nonAssetAswasList.map((it) => it.aswas_code?.trim() || ""));
        setAsset_asWas(assetAswasList.map((it) => it.aswas_code?.trim() || ""));
        setAsset_pptNo(assetAswasList.map((it) => it.ppt_no || ""));
        setToBeCodes(nonAssetTobeList.map((it) => it.tobe_code?.trim() || ""));
        setAsset_toBe(assetTobeList.map((it) => it.tobe_code?.trim() || ""));
        setLocalizedItems(
          localizationList.map((it) => ({
            id: it.id,
            local_code: it.local_code,
          }))
        );
        setDeleteIds([]);
      } else {
        alert("새로운 템플릿을 추가할 수 있습니다.");
        setSaveType("create");
        setIsTemplateCreated(false);
        setLocalizedItems([{ local_code: "" }, { local_code: "" }]);
        setDeleteIds([]);
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
      setIsTemplateCreated(false);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📄 핫픽스 템플릿 생성 및 불러오기</h2>
      <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        <div className="flex">
          <InputDrop _wrapperProps={{ className: "w-[260px]" }} _title="지라 티켓 번호" _value={ticketNum} _setValue={setTicketNum} _url="get-ticket-number" />
          <InputDrop _wrapperProps={{ className: "w-[400px] mx-auto" }} _title="URL" _value={ticketURL} _setValue={setTicketURL} _url="get-ticket-url" />
        </div>
        <button className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px]" onClick={checkForExistingTemplate}>
          확인
        </button>
      </div>
    </div>
  );
};

export default CheckTemplate;
