import React, { useState } from "react";
import axios from "axios";
import Translation_country_code from "./localization_country_code";
import { BASE_URL } from "@/utils/routePath";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShowDetail from "@Localization/ShowDetail";

const LocalizationVersion1 = () => {
  const [translationFile, setTranslationFile] = useState(null);
  const [translations, setTranslations] = useState({});
  const [rows, setRows] = useState([]);
  const [validCountries, setValidCountries] = useState([]);
  const [english_copies, setEnglish_copies] = useState([]);

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
      if (rows.length == 0) {
        setRows(
          new Array(4).fill(null).map(() => ({
            id: Date.now(),
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
        const updatedRows = [...prevRows];
        updatedRows[index].status =
          response.data.results.length > 0
            ? response.data.results[0].status
            : "error";
        updatedRows[index].downloadLink =
          response.data.results[0]?.file || null;
        updatedRows[index].untranslated_en =
          response.data.results[0]?.untranslatedEnglishCopies || [];
        updatedRows[index].untranslated_lo =
          response.data.results[0]?.untranslatedLocalCopies || [];
        return updatedRows;
      });

      if (
        response.data.results.length > 0 &&
        response.data.results[0].status === "success"
      ) {
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
      console.error("Error in translation:", err);
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index].status = "error";
        return updatedRows;
      });
    }
  };

  const handleCountryChange = (index, newCode) => {
    const updatedRows = [...rows];
    updatedRows[index].country_code = newCode;
    setRows(updatedRows);
  };

  const handleHtmlFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedRows = [...rows];
    updatedRows[index].htmlFiles = files;
    console.log(updatedRows[index].htmlFiles[0].name);
    setRows(updatedRows);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 번역 파일 업로드 */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-4 py-2 rounded border border-blue-200 cursor-pointer hover:bg-blue-200">
          <input
            type="file"
            accept=".txt"
            onChange={handleTranslationFileChange}
            hidden
          />
          <FileUploadIcon />
          <span>
            {translationFile
              ? translationFile.name
              : "📄 번역 기준 파일 업로드 (.txt)"}
          </span>
        </label>
      </div>

      {/* 각 번역 row 렌더링 */}
      {rows.length > 0 ? (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-4 bg-white border border-gray-200 p-4 rounded shadow-sm"
            >
              {/* 국가 선택 */}
              <Translation_country_code
                country_code={row.country_code}
                validCountries={validCountries}
                onChange={(code) => handleCountryChange(index, code)}
              />

              <label className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-200">
                <input
                  type="file"
                  accept=".html"
                  multiple
                  onChange={(e) => handleHtmlFileChange(index, e)}
                  hidden
                />
                <span>{row.htmlFiles?.[0]?.name || "Upload rc01"}</span>
              </label>

              {/* 번역 버튼 */}
              <button
                onClick={() => handleTranslate(index)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Translate
              </button>

              {/* 상태 표시 */}
              {row.status === "success" && (
                <CheckCircleIcon className="text-green-500 text-xl" />
              )}
              {row.status === "error" && (
                <ErrorIcon className="text-red-500 text-xl" />
              )}

              {/* 상세 보기 */}
              {(row.untranslated_en?.length > 0 ||
                row.translated?.length > 0) && (
                <ShowDetail
                  untranslatedCopies={row.untranslated_en}
                  untranslatedLocalCopies={row.untranslated_lo}
                />
              )}
            </div>
          ))}

          {/* Row 추가 */}
          <button
            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mt-4"
            onClick={() =>
              setRows([
                ...rows,
                {
                  id: Date.now(),
                  country_code: "",
                  htmlFiles: [],
                  status: null,
                },
              ])
            }
          >
            <AddCircleOutlineIcon /> Add Row
          </button>
        </div>
      ) : (
        // 초기 상태 안내
        <div className="flex flex-col items-center justify-center mt-16 text-gray-500">
          <FileUploadIcon sx={{ fontSize: 48 }} />
          <p className="mt-2 text-lg font-medium">
            Upload the copy deck in txt file.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocalizationVersion1;
