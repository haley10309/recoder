import React, { useState, useEffect } from "react";
import axios from "axios";
import "@Localization/LocalizationSetting.scss";
import Translation_country_code from "./localization_country_code";
import { BASE_URL } from "@/utils/routePath";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ShowDetail from "@Localization/ShowDetail";

const LocalizationSetting = () => {
  const [translationFile, setTranslationFile] = useState(null);
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

  // 더미 데이터 상태
  const [toBeCodes, setToBeCodes] = useState([]);

  useEffect(() => {
    const fetchDummyToBeCodes = async () => {
      const dummy = [
        { ppt: 1, code: "</sitecode/upgrade>upgrade</>" },
        { ppt: 1, code: "</sitecode/upgrade>upgrade</>" },
        { ppt: 2, code: "" },
      ];
      setToBeCodes(dummy);
    };

    fetchDummyToBeCodes();
  }, []);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowOptions(true);
  };

  const handleTranslationFileChange = async (e) => {
    const file = e.target.files[0];
    setTranslationFile(file);
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/translation_upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setValidCountries(response.data.validCountries);
      setTranslations(response.data.translations || {});
      setEnglish_copies(response.data.englishCopy || []);

      if (rows.length === 0) {
        setRows(
          new Array(4).fill(null).map(() => ({
            id: Date.now() + Math.random(),
            country_code: "",
            htmlFiles: [],
            status: null,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to upload translation file.");
    }
  };

  const handleTranslate = async (index) => {
    const row = rows[index];
    if (!row.country_code || row.htmlFiles.length === 0) {
      alert(
        "Please select a country and upload HTML files before translating."
      );
      return;
    }

    const localCopies = translations[row.country_code] || [];
    const formData = new FormData();
    row.htmlFiles.forEach((file) => formData.append("htmlFiles", file));
    formData.append("country_code", row.country_code);
    formData.append("english_copies", JSON.stringify(english_copies));
    formData.append("local_copies", JSON.stringify(localCopies));

    try {
      const response = await axios.post(
        `${BASE_URL}/translate_html`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setRows((prevRows) => {
        const updated = [...prevRows];
        const result = response.data.results[0] || {};
        updated[index] = {
          ...updated[index],
          status: result.status || "error",
          downloadLink: result.file || null,
          untranslated_en: result.untranslatedEnglishCopies || [],
          untranslated_lo: result.untranslatedLocalCopies || [],
        };
        return updated;
      });

      if (response.data.results[0]?.status === "success") {
        const blob = new Blob([response.data.results[0].htmlContent], {
          type: "text/html",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.data.results[0].file;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
  };

  const handleCountryChange = (index, newCode) => {
    const updated = [...rows];
    updated[index].country_code = newCode;
    setRows(updated);
  };

  const handleHtmlFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updated = [...rows];
    updated[index].htmlFiles = files;
    setRows(updated);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleCodeDelete = (index) => {
    const updated = [...toBeCodes];
    updated.splice(index, 1);
    setToBeCodes(updated);
  };

  return (
    <div className="LocalizationPageWrapper">
      <h1 className="title">로컬라이제이션 템플릿 생성 페이지</h1>

      {/* 템플릿 선택 */}
      <div className="template-box">
        <div className="template-select-row">
          <div className="template-title">템플릿 불러오기</div>
          <div className="template-buttons">
            <button
              className={`template-btn ${
                selectedTemplate === "1차 TO BE" ? "active" : ""
              }`}
              onClick={() => handleTemplateClick("1차 TO BE")}
            >
              1차 TO BE
            </button>
            <button
              className={`template-btn ${
                selectedTemplate === "로컬라이제이션 적용" ? "active" : ""
              }`}
              onClick={() => handleTemplateClick("로컬라이제이션 적용")}
            >
              로컬라이제이션 적용
            </button>
          </div>
        </div>

        {showOptions && (
          <div className="dropdown-row">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">프로젝트명</option>
              <option value="A">프로젝트 A</option>
              <option value="B">프로젝트 B</option>
            </select>
            <select value={pdp} onChange={(e) => setPdp(e.target.value)}>
              <option value="">PDP</option>
              <option value="features">Features</option>
              <option value="compare">Compare</option>
            </select>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value="">Product Name</option>
              <option value="prod1">Product1</option>
              <option value="prod2">Product2</option>
            </select>
            <button className="load-btn">불러오기</button>
          </div>
        )}
      </div>

      {/* 텍스트 파일 업로드 */}
      <div className="upload-file-row">
        <label className="fileupload-label">
          <input type="file" accept=".txt" onChange={handleFileUpload} hidden />
          <span className="fileupload-button">fileupload</span>
        </label>
        <span className="file-name">
          {uploadedFile?.name || "copydeck.txt"}
        </span>
      </div>

      {/* TO-BE 코드 확인 */}
      <div className="code-check-box">
        <div className="code-check-title">TO-BE 코드 확인하기</div>
        <table className="code-table">
          <thead>
            <tr>
              <th>PPT NO.</th>
              <th>To-Be Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {toBeCodes.map((row, idx) => (
              <tr key={idx}>
                <td>{row.ppt}</td>
                <td>
                  <div className="code-cell">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: row.code.replace(
                          /upgrade/g,
                          `<span class="highlight">upgrade</span>`
                        ),
                      }}
                    />
                  </div>
                </td>
                <td>
                  {row.code && (
                    <button
                      onClick={() => handleCodeDelete(idx)}
                      className="delete-btn"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 저장하기 버튼 */}
      <div className="save-btn-container">
        <button className="save-btn">저장하기</button>
      </div>
    </div>
  );
};

export default LocalizationSetting;
