import React, { useState, useEffect } from "react";
// import TemplateSelect from "@LocalizationComponent/TemplateSelect";
// import TxtFileUpload from "@LocalizationComponent/TxtFileUpload";
// import CountryRows from "@LocalizationComponent/CountryRows";
// import { localizationDummyData } from "@/dummy_data/setting_dummy";

const Localization = () => {
  const [project, setProject] = useState("");
  const [pdp, setPdp] = useState("");
  const [product, setProduct] = useState("");
  const [filename, setFilename] = useState("파일을 선택해주세요");
  const [validCountries, setValidCountries] = useState([]);
  const [translationData, setTranslationData] = useState({});

  useEffect(() => {
    // setValidCountries(localizationDummyData.validCountries);
    // setTranslationData(localizationDummyData.translationData);
  }, []);

  return (
    <div className="px-6 py-10 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-8">🌐 로컬라이제이션 적용 페이지</h1>

      {/* <TemplateSelect
        {...{ project, pdp, product, setProject, setPdp, setProduct }}
      />
      <TxtFileUpload
        {...{ filename, setFilename, setValidCountries, setTranslationData }}
      />
      <CountryRows {...{ validCountries, translationData }} />

      <div className="text-right mt-8">
        <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded px-3 py-1 cursor-pointer">
          다운로드
        </button>
      </div> */}
    </div>
  );
};

export default Localization;
