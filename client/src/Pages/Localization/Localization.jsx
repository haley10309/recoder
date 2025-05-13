import React, { useState, useEffect } from "react";

import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";

const Localization = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketURL,
      setTicketURL,
      saveType,
      setSaveType,
      isTemplateCreated,
      setIsTemplateCreated,
      localizedItems,
      setLocalizedItems,
      deleteIds,
      setDeleteIds,
      nonAssetAsWasCodes,
      setNonAssetAsWasCodes,
      nonAssetToBeCodes,
      setNonAssetToBeCodes,
      nonAssetPptNos,
      setNonAssetPptNos,
      assetAsWasCodes,
      setAssetAsWasCodes,
      assetToBeCodes,
      setAssetToBeCodes,
      assetPptNos,
      setAssetPptNos,
      setTemplateID,
      originalHtmlFile,
      setOriginalHtmlFile,
      addTextArea,
      removeTextArea,
      addAssetArea,
      removeAssetArea,
      handleAssetAsWasChange,
      handleAssetToBeChange,
      handleAssetPptNoChange,
      countOccurrences,
      handleSaveTemplate,
  } = useCheckTemplate();

  const [project, setProject] = useState("");
  const [pdp, setPdp] = useState("");
  const [product, setProduct] = useState("");
  const [filename, setFilename] = useState("파일을 선택해주세요");
  const [validCountries, setValidCountries] = useState([]);
  const [translationData, setTranslationData] = useState({});
  
// Localization states
// const [englishCopyList, setEnglishCopyList] = useState([]);
// const [tobeCodeList, setTobeCodeList] = useState([]);

  // 로컬라이제이션 생성
  // const handleCreateOrUpdateLocalization = async () => {
  //   if (!isTemplateCreated) {
  //     alert("핫픽스 템플릿을 먼저 생성해 주세요.");
  //     return;
  //   }
  //   try {
  //     const body = { 
  //       ticket_num: ticketNum, 
  //       ticket_url: ticketURL, 
  //       localization_list: 
  //         localizedItems.map((item) => (
  //           item.id 
  //             ? { id: item.id, local_code: item.local_code }
  //             : { local_code: item.local_code }
  //         )), 
  //       delete_ids: deleteIds,
  //     };
      
  //     await axios.put(`${BASE_URL}/localization/template`, body, { headers: { "Content-Type": "application/json" } });
  //     setDeleteIds([]);
  //     const { data } = await axios.post(`${BASE_URL}/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketURL });
  //     setLocalizedItems(data.localization_list || []);
  //     alert(saveType === "update" ? "로컬라이제이션 템플릿이 수정되었습니다" : "로컬라이제이션 템플릿이 생성되었습니다");
  //   } catch (err) {
  //     console.error("[Error] handleCreateOrUpdateLocalization", err);
  //     alert(saveType === "update" ? "로컬라이제이션 수정 중 오류가 발생했습니다" : "로컬라이제이션 생성 중 오류가 발생했습니다");
  //   }
  // };

  useEffect(() => {
    // setValidCountries(localizationDummyData.validCountries);
    // setTranslationData(localizationDummyData.translationData);
  }, []);

  // tobe-code-list API call
  // useEffect(() => {
  //   // TODO: tobecode list를 다시 덮어버리는데, 이거 수정하기
  //   if (englishCopyList.length > 0 && ticketNum && ticketURL) {
  //     // tobe 코드를 다시 바꿔야 하는 이유???
  //     // 로컬라이제이션이랑 아예 분리할거면 이건 안하는게 맞음
  //     axios
  //       .post(`${BASE_URL}/localization/tobe-code-list`, {
  //         ticket_num: ticketNum,
  //         ticket_url: ticketURL,
  //       })
  //       .then((res) => setTobeCodeList(res.data.tobe_code_list || []))
  //       .catch((err) => console.error(err));
  //   }
  // }, [englishCopyList, ticketNum, ticketURL]);

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      {/* 📄 템플릿 불러오기 */}
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📄 템플릿 불러오기</h2>
      <CheckTemplate
        path="localize-template"
        ticketNum={ticketNum}
        ticketURL={ticketURL}
        setTicketNum={setTicketNum}
        setTicketURL={setTicketURL}
        setTemplateID={setTemplateID}
        setIsTemplateCreated={setIsTemplateCreated}
        setSaveType={setSaveType}
        setNonAssetPptNos={setNonAssetPptNos}
        setNonAssetAsWasCodes={setNonAssetAsWasCodes}
        setNonAssetToBeCodes={setNonAssetToBeCodes}
        setAssetPptNos={setAssetPptNos}
        setAssetAsWasCodes={setAssetAsWasCodes}
        setAssetToBeCodes={setAssetToBeCodes}
        setLocalizedItems={setLocalizedItems}
        setDeleteIds={setDeleteIds}
      />
      
      {/* TODO: create-template에 있던 컴포넌트 잘 옮기기~ */}
      {/* TODO: 원본코드도 올려야 하나? */}

      {/* 📤 번역 파일 업로드 */}
      {/* <TransFileUpload 
        isTemplateCreated={isTemplateCreated}
        tobeCodeList={tobeCodeList}
        setEnglishCopyList={setEnglishCopyList}
        setLocalizedItems={setLocalizedItems}
      /> */}

      {/* 🌐 로컬라이제이션 템플릿 */}
      <h2 className="font-bold text-black text-[16px] mb-[15px] mt-[30px]">🌐 로컬라이제이션 템플릿</h2>
      {/* <div className="flex flex-col">
        {localizedItems.map((item, idx) => (
          <TransBox
            key={idx}
            text={item.local_code}
            highlights={englishCopyList}
            onChange={(newTxt) => {
              setLocalizedItems((prev) => {
                const a = [...prev];
                a[idx].local_code = newTxt;
                return a;
              });
            }}
            onDelete={() => {
              setLocalizedItems((prev) => prev.filter((_, i) => i !== idx));
              if (item.id) setDeleteIds((prev) => [...prev, item.id]);
            }}
          />
        ))}
      </div>
      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button className="plus-button rounded-[10px]" onClick={() => setLocalizedItems((prev) => [...prev, { local_code: "" }])}>
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleCreateOrUpdateLocalization} disabled={!isTemplateCreated}>
          {saveType === "update" ? ` 로컬라이제이션 템플릿 수정` : ` 로컬라이제이션 템플릿 생성`}
        </button>
      </div> */}
    </div>
  );
};

export default Localization;
