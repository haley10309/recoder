import { useRef, useState } from 'react';
import axios from 'axios';
import Asset_Template from '@Create_Template/Asset_template';
import { BASE_URL } from "@/utils/routePath";

const UploadFiles = ({asset_pptNo, asset_asWas, setAsset_asWas, asset_toBe, setAsset_toBe,addAssetArea, isTemplateAvailable, setAsset_pptNo, fileContent, setPptNos, setAsWasCodes, setToBeCodes }) => {

  const fileInputRef = useRef(null);
  const [txtFile, setTxtFile]  = useState(null);
  const handleAssetSave = () => {
    // console.log('Assets saved successfully.');
  };

  const handleSubmit = async (file) => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("txtfile", file);
  
    try {
      const res = await axios.post(`${BASE_URL}/guide-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // console.log("Server Response:", res.data);
  
      const { pptNos = [], asWasCodes = [], toBeCodes = [] } = res.data;
      if (!Array.isArray(pptNos) || !Array.isArray(asWasCodes) || !Array.isArray(toBeCodes)) {
        throw new Error("Invalid data format from server");
      }
  
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
        const asWasCode = asWasCodes[idx] || "";
        const toBeCode = toBeCodes[idx] || "";
  
        if (asWasCode.trim().startsWith("//") || toBeCode.trim().startsWith("//")) {
          assetPptNos.push(pptNo);
          assetAsWasCodes.push(asWasCode);
          assetToBeCodes.push(toBeCode);
        } else {
          regularPptNos.push(pptNo);
          regularAsWasCodes.push(asWasCode);
          regularToBeCodes.push(toBeCode);
        }
      });
  
      setPptNos(regularPptNos);
      setAsWasCodes(regularAsWasCodes);
      setToBeCodes(regularToBeCodes);
  
      setAsset_pptNo(assetPptNos);
      setAsset_asWas(assetAsWasCodes);
      setAsset_toBe(assetToBeCodes);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("파일 업로드에 실패했습니다.");
    }
  };

  const handlePptFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setTxtFile(selectedFile);
    handleSubmit(selectedFile);
};

  const removeAssetArea = (index) => {
    setAsset_asWas(asset_asWas.filter((_, i) => i !== index));
    setAsset_toBe(asset_toBe.filter((_, i) => i !== index));
    setAsset_pptNo(asset_pptNo.filter((_, i) => i !== index));
  };

  const handleAssetAsWasChange = (index, value) => {
    setAsset_asWas(prev => {
      const newAssetAsWas = [...prev];
      newAssetAsWas[index] = value;
      return newAssetAsWas;
    });
  };
      
  const handleAssetToBeChange = (index, value) => {
    setAsset_toBe(prev => {
      const newAssetToBe = [...prev];
      newAssetToBe[index] = value;
      return newAssetToBe;
    });
  };
  
  const handleAssetPptNoChange = (index, newValue) => {
    setAsset_pptNo((prev) => {
      const updatedPptNos = [...prev]; 
      updatedPptNos[index] = newValue;
      // console.log("Updated asset_pptNo:", updatedPptNos);
      return updatedPptNos;
    });
  };

    return (
    <div className="flex flex-col justify-center items-start rounded-[10px] p-8 bg-white border border-gray-300 text-[#32383E] my-14 w-full">
      <h2 className="font-bold text-black mb-5 text-[16px]">업로드</h2>
      <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div className="file-upload-container">
              <form>
                <div className="guide_upload_div">
                  <label className="file-upload-label">
                      <input
                        type="file"
                        accept=".txt"
                        ref={fileInputRef}
                        onChange={handlePptFileChange}
                        style={{ display: "none" }}
                      />
                      <span
                        className="txt-file-upload-button"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        가이드 업로드
                      </span>
                  </label>
                  {txtFile ? (<h3 className="txtfile_title">{txtFile.name}</h3>):(<></>)}</div>
              </form>
            </div>
         <div className='flex gap-2'>
          <button
            type="button"
            className="flex justify-center items-center ring-2 ring-[#007CFF] bg-white text-[#007CFF] hover:bg-[#007CFF] hover:text-white font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]"
            onClick={() => document.getElementById("file-upload").click()}
          >
            Run Test
          </button>
          <Asset_Template
            asset_pptNo={asset_pptNo}
            asset_asWas={asset_asWas} 
            asset_toBe={asset_toBe}
            addAssetArea={addAssetArea} 
            removeAssetArea={removeAssetArea}
            isTemplateAvailable={isTemplateAvailable}
            setAsset_asWas={handleAssetAsWasChange}
            setAsset_toBe={handleAssetToBeChange}
            setAsset_pptNo={handleAssetPptNoChange}
            fileContent={fileContent}
            onSave={handleAssetSave} 
            />
         </div>
        </div>
      </div>
    </div>
    )
}

export default UploadFiles;