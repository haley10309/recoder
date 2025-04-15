import { useRef, useState } from 'react';
import axios from 'axios';
import Asset_Template from '@Create_Template/Asset_template';
import { BASE_URL } from "@/utils/routePath";

const UploadFiles = ({ file, asset_pptNo, asset_asWas, setAsset_asWas, asset_toBe, setAsset_toBe,addAssetArea, isTemplateAvailable, setAsset_pptNo, fileContent, setPptNos, setAsWasCodes, setToBeCodes, setFileContent, setFile }) => {

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
        console.log("File content read successfully:", event.target.result);
      };
      reader.readAsText(selectedFile);
    } else {
      console.log("No file selected");
    }
  };

  function formatFileSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`; // 바이트
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`; // 킬로바이트
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`; // 메가바이트
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // 기가바이트 (옵션)
    }
  }

  return (
  <div className="flex flex-col justify-center items-start rounded-[10px] p-8 bg-white border border-gray-300 text-[#32383E] my-14 w-full">
    <h2 className="font-bold text-black mb-5 text-[16px]">업로드</h2>
    <div className="flex flex-col w-full">
        <div className="flex justify-between items-center w-[100%]">
          <div className="flex justify-start items-center gap-2 w-[70%] bg-[#fcf0eb] rounded-[10px] p-2">
            <form className='hover:cursor-pointer'>
              <div className="flex justify-center items-center ring-0 bg-[#ffcbb8] rounded-[10px] h-[50px] w-[50px]">
                <label className="file-upload-label">
                    <input
                      type="file"
                      accept=".txt"
                      ref={fileInputRef}
                      onChange={handlePptFileChange}
                      style={{ display: "none" }}
                    />
                    <div className='flex justify-center items-center hover:cursor-pointer'>
                      <svg className="w-8 h-8" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 6.5V6H2V6.5H2.5ZM6.5 6.5V6H6V6.5H6.5ZM13.5 3.5H14V3.29289L13.8536 3.14645L13.5 3.5ZM10.5 0.5L10.8536 0.146447L10.7071 0H10.5V0.5ZM2.5 7H3.5V6H2.5V7ZM3 11V8.5H2V11H3ZM3 8.5V6.5H2V8.5H3ZM3.5 8H2.5V9H3.5V8ZM4 7.5C4 7.77614 3.77614 8 3.5 8V9C4.32843 9 5 8.32843 5 7.5H4ZM3.5 7C3.77614 7 4 7.22386 4 7.5H5C5 6.67157 4.32843 6 3.5 6V7ZM6.5 7H7.5V6H6.5V7ZM7 11V8.5H6V11H7ZM7 8.5V6.5H6V8.5H7ZM7.5 8H6.5V9H7.5V8ZM8 7.5C8 7.77614 7.77614 8 7.5 8V9C8.32843 9 9 8.32843 9 7.5H8ZM7.5 7C7.77614 7 8 7.22386 8 7.5H9C9 6.67157 8.32843 6 7.5 6V7ZM11 6V11H12V6H11ZM10 7H13V6H10V7ZM2 5V1.5H1V5H2ZM13 3.5V5H14V3.5H13ZM2.5 1H10.5V0H2.5V1ZM10.1464 0.853553L13.1464 3.85355L13.8536 3.14645L10.8536 0.146447L10.1464 0.853553ZM2 1.5C2 1.22386 2.22386 1 2.5 1V0C1.67157 0 1 0.671573 1 1.5H2ZM1 12V13.5H2V12H1ZM2.5 15H12.5V14H2.5V15ZM14 13.5V12H13V13.5H14ZM12.5 15C13.3284 15 14 14.3284 14 13.5H13C13 13.7761 12.7761 14 12.5 14V15ZM1 13.5C1 14.3284 1.67157 15 2.5 15V14C2.22386 14 2 13.7761 2 13.5H1Z" fill="#F7622C"/>
                      </svg>
                    </div>
                </label>
              </div>
            </form>
            <div className='flex justify-between w-full p-4 items-center'>
               <span
                  className="text-[#F7622C] font-[600] text-[15px]"
                  onClick={(e) => e.stopPropagation()} 
                >
                  PPT txt 가이드 업로드
                </span>
                {txtFile ? (<p className="text-black font-[400] text-[13px]">{txtFile.name}</p>):(<></>)}
                {txtFile ? (<p className="text-black font-[400] text-[13px]">{formatFileSize(txtFile.size)}</p>) : (<></>)}
            </div>
           
          </div>
          <div className='flex gap-2'>
            {/* {file ? (
                <label htmlFor="file-upload" className="file-upload-label">
                  {file.name}
                </label>
              ) : (
                <label htmlFor="file-upload" className="file-upload-label">
                  
                </label>
              )} */}
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".js,.html,.css"
                className="hidden"
              />
            <button
              type="button"
              className="flex justify-center items-center bg-black text-white hover:bg-gray-700 font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]"
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
          {/* <div className='flex gap-2'>
          {file ? (
              <label htmlFor="file-upload" className="file-upload-label">
                {file.name}
              </label>
            ) : (
              <label htmlFor="file-upload" className="file-upload-label">
                
              </label>
            )}
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".js,.html,.css"
                className="hidden"
              />
            <button
              type="button"
              className="flex justify-center items-center bg-black text-white hover:bg-gray-700 font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]"
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
          </div> */}
      </div>
    </div>
  </div>
  )
}

export default UploadFiles;