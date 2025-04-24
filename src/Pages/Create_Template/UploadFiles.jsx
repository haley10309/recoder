import { useRef, useState } from "react";
import axios from "axios";
import Asset_Template from "@Create_Template/Asset_template";
import { BASE_URL } from "@/utils/routePath";
import arrowIcon from "@/assets/shift-fill.svg";

export default function UploadFiles({ asset_pptNo, asset_asWas, setAsset_asWas, asset_toBe, setAsset_toBe, addAssetArea, isTemplateAvailable, setAsset_pptNo, fileContent, setPptNos, setAsWasCodes, setToBeCodes, setFileContent, setFile, setEnglishCopy }) {
  const pptInputRef = useRef(null);
  const transInputRef = useRef(null);

  const [pptFile, setPptFile] = useState(null);
  const [transFile, setTransFile] = useState(null);

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  // PPT.txt 업로드 처리
  const handlePptSubmit = async (file) => {
    const formData = new FormData();
    formData.append("txtfile", file);
    try {
      const res = await axios.post(`${BASE_URL}/guide-upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { pptNos = [], asWasCodes = [], toBeCodes = [] } = res.data;
      if (!Array.isArray(pptNos) || !Array.isArray(asWasCodes) || !Array.isArray(toBeCodes)) {
        throw new Error("Invalid data format from server");
      }
      // 상태 초기화
      setPptNos([]);
      setAsWasCodes([]);
      setToBeCodes([]);
      setAsset_asWas([]);
      setAsset_toBe([]);
      setAsset_pptNo([]);

      const regularPptNos = [];
      const regularAsWasCodes = [];
      const regularToBeCodes = [];
      const assetPptNos = [];
      const assetAsWasCodes = [];
      const assetToBeCodes = [];

      pptNos.forEach((pptNo, idx) => {
        const asWas = asWasCodes[idx] || "";
        const toBe = toBeCodes[idx] || "";
        if (asWas.trim().startsWith("//") || toBe.trim().startsWith("//")) {
          assetPptNos.push(pptNo);
          assetAsWasCodes.push(asWas);
          assetToBeCodes.push(toBe);
        } else {
          regularPptNos.push(pptNo);
          regularAsWasCodes.push(asWas);
          regularToBeCodes.push(toBe);
        }
      });

      setPptNos(regularPptNos);
      setAsWasCodes(regularAsWasCodes);
      setToBeCodes(regularToBeCodes);
      setAsset_pptNo(assetPptNos);
      setAsset_asWas(assetAsWasCodes);
      setAsset_toBe(assetToBeCodes);
    } catch (error) {
      console.error("Error uploading PPT file:", error);
      alert("PPT 업로드에 실패했습니다.");
    }
  };
  const handlePptFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPptFile(f);
    handlePptSubmit(f);
  };

  // 번역.txt 업로드
  const handleTransSubmit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${BASE_URL}/localization/english-copy`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setEnglishCopy(res.data.englishCopy); // ← 여기서 번역 결과 전달
    } catch (error) {
      console.error("Error uploading translation file:", error);
      alert("번역 업로드에 실패했습니다.");
    }
  };
  const handleTransFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setTransFile(f);
    handleTransSubmit(f);
  };

  // Run Test 파일 처리
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setFileContent(ev.target.result);
      reader.readAsText(f);
    }
  };

  // Asset_Template 핸들러
  const removeAssetArea = (i) => {
    setAsset_asWas((prev) => prev.filter((_, idx) => idx !== i));
    setAsset_toBe((prev) => prev.filter((_, idx) => idx !== i));
    setAsset_pptNo((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleAssetAsWasChange = (i, v) =>
    setAsset_asWas((prev) => {
      const arr = [...prev];
      arr[i] = v;
      return arr;
    });
  const handleAssetToBeChange = (i, v) =>
    setAsset_toBe((prev) => {
      const arr = [...prev];
      arr[i] = v;
      return arr;
    });
  const handleAssetPptNoChange = (i, v) =>
    setAsset_pptNo((prev) => {
      const arr = [...prev];
      arr[i] = v;
      return arr;
    });

  return (
    <div className="mt-14 mb-14 w-full">
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📤 파일 업로드</h2>
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[10px] py-[30px]">
        {/* PPT.txt 업로드 박스 */}
        <div className="flex flex-col justify-center items-center w-[330px] h-[120px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" onClick={() => pptInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 text-[#32383E] font-[500] text-[15px]">PPT.txt 파일을 업로드 해 주세요</p>
          <input type="file" accept=".txt" ref={pptInputRef} onChange={handlePptFileChange} className="hidden" />
          {pptFile && (
            <div className="mt-2 text-center text-[13px]">
              <p className="text-black">{pptFile.name}</p>
              <p className="text-black">{formatFileSize(pptFile.size)}</p>
            </div>
          )}
        </div>

        {/* 번역.txt 업로드 박스 */}
        <div className="flex flex-col justify-center items-center w-[330px] h-[120px] border-2 border-dashed border-gray-300 rounded-[10px] cursor-pointer" onClick={() => transInputRef.current.click()}>
          <img src={arrowIcon} alt="upload arrow" className="w-8 h-8 text-gray-500" />
          <p className="mt-3 font-[500] text-[15px]">번역.txt 파일을 업로드 해 주세요</p>
          <input type="file" accept=".txt" ref={transInputRef} onChange={handleTransFileChange} className="hidden" />
          {transFile && (
            <div className="mt-2 text-center text-[13px]">
              <p>{transFile.name}</p>
              <p>{formatFileSize(transFile.size)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Run Test 버튼 & Asset_Template */}
      <div className="flex gap-2 items-center mt-6 justify-center">
        <input type="file" id="file-upload" onChange={handleFileChange} accept=".js,.html,.css" className="hidden" />
        <button type="button" className="flex justify-center items-center bg-black text-white hover:bg-gray-700 font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]" onClick={() => document.getElementById("file-upload").click()}>
          Run Test
        </button>
        <Asset_Template asset_pptNo={asset_pptNo} asset_asWas={asset_asWas} asset_toBe={asset_toBe} addAssetArea={addAssetArea} removeAssetArea={removeAssetArea} isTemplateAvailable={isTemplateAvailable} setAsset_asWas={handleAssetAsWasChange} setAsset_toBe={handleAssetToBeChange} setAsset_pptNo={handleAssetPptNoChange} fileContent={fileContent} onSave={() => {}} />
      </div>
    </div>
  );
}
