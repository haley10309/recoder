import React, { useState, useEffect } from "react";
import axios from "axios";
import TemplateSelector from "@Components/LocalizationSetting/TemplateSelector";
import TextInputList from "@Components/LocalizationSetting/TextInputList";
import ToBeCodeTable from "@Components/LocalizationSetting/ToBeCodeTable";
import { BASE_URL } from "@/utils/routePath";
import { DUMMY_PROJECTS, DUMMY_PDPS, DUMMY_PRODUCTS, DUMMY_TO_BE_CODES } from "@DummyData/setting_dummy";

const LocalizationSetting = () => {
  const [translations, setTranslations] = useState({});
  const [rows, setRows] = useState([]);
  const [validCountries, setValidCountries] = useState([]);
  const [english_copies, setEnglish_copies] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [project, setProject] = useState("");
  const [pdp, setPdp] = useState("");
  const [product, setProduct] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputTexts, setInputTexts] = useState([""]);
  const [toBeCodes, setToBeCodes] = useState([]);

  useEffect(() => {
    setToBeCodes(DUMMY_TO_BE_CODES);
  }, []);

  const handleInputChange = (index, value) => {
    const updated = [...inputTexts];
    updated[index] = value;
    setInputTexts(updated);
  };

  const addInputRow = () => {
    setInputTexts((prev) => [...prev, ""]);
  };

  const handleApplyClick = () => {
    console.log("입력된 텍스트들:", inputTexts);
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowOptions(true);
  };

  const handleCodeDelete = (index) => {
    const updated = [...toBeCodes];
    updated.splice(index, 1);
    setToBeCodes(updated);
  };

  return (
    <div className="p-10 min-h-screen bg-[#f9fafb] text-sm text-gray-800">
      <h1 className="text-2xl font-bold mb-8">로컬라이제이션 템플릿 생성</h1>

      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateClick={handleTemplateClick}
        showOptions={showOptions}
        project={project}
        pdp={pdp}
        product={product}
        setProject={setProject}
        setPdp={setPdp}
        setProduct={setProduct}
      />

      <TextInputList
        inputTexts={inputTexts}
        onChange={handleInputChange}
        onAddRow={addInputRow}
        onApply={handleApplyClick}
      />

      <ToBeCodeTable toBeCodes={toBeCodes} onDelete={handleCodeDelete} />
    </div>
  );
};

export default LocalizationSetting;
