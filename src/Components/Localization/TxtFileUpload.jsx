import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

const TxtFileUpload = ({
  filename,
  setFilename,
  setValidCountries,
  setTranslationData,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setFilename(file.name);
  };

  const handleApplyClick = async () => {
    if (!selectedFile) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${BASE_URL}/translation_upload`, formData);
      setValidCountries(res.data.validCountries);
      setTranslationData(res.data.translations);
      alert("업로드 성공!");
    } catch (err) {
      alert("업로드 실패!");
    }
  };

  return (
    <div className="mb-6 p-6 bg-white rounded shadow">
      <h2 className="font-semibold text-lg mb-4">📤 TXT 파일 업로드</h2>
      <div className="flex items-center gap-4">
        <label className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded px-3 py-1 cursor-pointer">
          <input type="file" hidden onChange={handleFileChange} />
          파일 선택
        </label>
        <span className="flex-1 text-sm text-gray-600">{filename}</span>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-black-600 rounded px-3 py-1 cursor-pointer"
          onClick={handleApplyClick}
        >
          적용하기
        </button>
      </div>
    </div>
  );
};

export default TxtFileUpload;
