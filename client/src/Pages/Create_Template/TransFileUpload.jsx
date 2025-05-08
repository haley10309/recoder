import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import arrowIcon from "@/assets/shift-fill.svg";

export default function TransFileUpload({ setEnglishCopy }) {
  const transInputRef = useRef(null);
  const [transFile, setTransFile] = useState(null);

  function formatFileSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleTransSubmit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${BASE_URL}/localization/english-copy`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setEnglishCopy(res.data.englishCopy);
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

  return (
    <div className="mt-[100px] mb-[100px] w-full ">
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📤 번역 파일 업로드</h2>
      <div className="flex justify-center gap-[40px] bg-[#f9f9f9] rounded-[8px] py-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
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
    </div>
  );
}
