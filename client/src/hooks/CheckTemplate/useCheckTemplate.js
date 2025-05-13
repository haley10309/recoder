import { useState } from "react";
import axios from "axios";

import { kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useCheckTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] = useState("");

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로

  // TODO: local_code: localized_tobe_code로 수정 필요
  const [localizedItems, setLocalizedItems] = useState([{ local_code: "" }, { local_code: "" }]); // copy 적용 필요한 tobe_code를 모아둔 리스트
  const [deleteIds, setDeleteIds] = useState([]);

  // non-asset states
  const [nonAssetAsWasCodes, setNonAssetAsWasCodes] = useState(["", "", ""]);
  const [nonAssetToBeCodes, setNonAssetToBeCodes] = useState(["", "", ""]);
  const [nonAssetPptNos, setNonAssetPptNos] = useState(["", "", ""]);

  // asset states
  const [assetAsWasCodes, setAssetAsWasCodes] = useState([]);
  const [assetToBeCodes, setAssetToBeCodes] = useState([]);
  const [assetPptNos, setAssetPptNos] = useState([]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState("");
  const isTemplateAvailable = Boolean(templateID);

  // File upload and content
  const [originalHtmlFile, setOriginalHtmlFile] = useState("");

  // add/remove handlers
  const addTextArea = () => {
    setNonAssetPptNos((prev) => [...prev, ""]);
    setNonAssetAsWasCodes((prev) => [...prev, ""]);
    setNonAssetToBeCodes((prev) => [...prev, ""]);
  };
  const removeTextArea = (idx) => {
    setNonAssetPptNos((prev) => prev.filter((_, i) => i !== idx));
    setNonAssetAsWasCodes((prev) => prev.filter((_, i) => i !== idx));
    setNonAssetToBeCodes((prev) => prev.filter((_, i) => i !== idx));
  };
  const addAssetArea = () => {
    setAssetPptNos((prev) => [...prev, ""]);
    setAssetAsWasCodes((prev) => [...prev, ""]);
    setAssetToBeCodes((prev) => [...prev, ""]);
  };

  // Asset handlers
  const removeAssetArea = (i) => {
    setAssetAsWasCodes((prev) => prev.filter((_, idx) => idx !== i));
    setAssetToBeCodes((prev) => prev.filter((_, idx) => idx !== i));
    setAssetPptNos((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleAssetAsWasChange = (i, v) =>
    setAssetAsWasCodes((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetToBeChange = (i, v) =>
    setAssetToBeCodes((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetPptNoChange = (i, v) =>
    setAssetPptNos((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });

  const countOccurrences = (asWasCode) => kind_countOccurrences(originalHtmlFile, asWasCode);

  // 핫픽스 템플릿 저장
  const handleSaveTemplate = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    for (let i = 0; i < nonAssetAsWasCodes.length; i++) {
      if (!nonAssetAsWasCodes[i].trim() && !nonAssetToBeCodes[i].trim()) {
        alert("AS-WAS와 TO-BE 코드 중 최소 하나는 입력해 주세요.");
        return;
      }
    }

    const combinedPptNos = [...nonAssetPptNos, ...assetPptNos];
    const combinedAsWas = [...nonAssetAsWasCodes, ...assetAsWasCodes];
    const combinedToBe = [...nonAssetToBeCodes, ...assetToBeCodes];
    const aswasTobeList = combinedAsWas.map((_, idx) => ({
      ppt_no: combinedPptNos[idx],
      aswas_code: combinedAsWas[idx],
      tobe_code: combinedToBe[idx],
    }));
    const formData = new FormData();
    formData.append("templateId", templateID);
    formData.append("ticket_num", ticketNum);
    formData.append("ticket_url", ticketURL);
    formData.append("create_date", new Date().toISOString().split("T")[0]);
    formData.append("aswas_tobe_list", JSON.stringify(aswasTobeList));

    try {
      const url = saveType === "create" ? `${BASE_URL}/create` : `${BASE_URL}/update-template`;
      await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("템플릿이 성공적으로 저장되었습니다");
      setIsTemplateCreated(true);
    } catch (err) {
      console.error(err);
      setIsTemplateCreated(false);
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  return {
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
      templateID,
      setTemplateID,
      isTemplateAvailable,
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
  };
};
