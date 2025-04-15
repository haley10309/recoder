import React, { useState, useEffect } from "react";
import "@Localization/Localization.scss";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Translation_country_code from "./localization_country_code";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";

const Localization = () => {
  const [project, setProject] = useState("");
  const [pdp, setPdp] = useState("");
  const [product, setProduct] = useState("");
  const [filename, setFilename] = useState("파일명");
  const [sitecode, setSitecode] = useState("");
  const [translationFile, setTranslationFile] = useState(null);
  const [translations, setTranslations] = useState({});
  const [rows, setRows] = useState([]);
  const [validCountries, setValidCountries] = useState([]);
  const [english_copies, setEnglish_copies] = useState([]);

  // TO-BE 코드 더미 데이터 상태
  const [toBeCodes, setToBeCodes] = useState([]);

  useEffect(() => {
    const fetchDummyToBeCodes = async () => {
      const dummyData = [
        {
          ppt: 1,
          asWas:
            "</sitecode/\nupgrade><span class='highlight'>upgrade</span></>",
          toBe: "</sitecode/upgrade><span class='highlight-red'>업그레이드</span></>",
          applied: true,
        },
        {
          ppt: 2,
          asWas: "",
          toBe: "",
          applied: false,
        },
      ];
      setToBeCodes(dummyData);
    };

    fetchDummyToBeCodes();
  }, []);

  const handleTranslationFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("Uploaded File:", file);
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
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-xl font-bold mb-6">로컬라이제이션 적용 페이지</h1>

      {/* 템플릿 불러오기 필터 영역 */}
      <div className="bg-white border rounded-md p-4 mb-4">
        <h2 className="font-semibold mb-3">로컬라이제이션 템플릿 불러오기</h2>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">프로젝트명</option>
            <option value="proj1">프로젝트 1</option>
          </select>
          <select
            value={pdp}
            onChange={(e) => setPdp(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">PDP</option>
            <option value="features">Features</option>
          </select>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Product Name</option>
            <option value="prod1">Product 1</option>
          </select>
          <div className="flex items-center border px-3 rounded bg-gray-100 text-sm">
            {filename}
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            불러오기
          </button>
        </div>

        <div className="flex gap-4">
          <select
            value={sitecode}
            onChange={(e) => setSitecode(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">국가(sitecode)</option>
            {validCountries.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TO-BE 코드 확인하기 */}
      <div className="bg-white border rounded-md p-4">
        <h2 className="font-semibold text-lg mb-4">TO-BE 코드 확인하기</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 w-[10%]">PPT NO.</th>
              <th className="p-2 w-[40%]">로컬라이제이션 AS WAS</th>
              <th className="p-2 w-[40%]">로컬라이제이션 TO BE</th>
              <th className="p-2 w-[10%] text-center">적용 여부</th>
            </tr>
          </thead>
          <tbody>
            {toBeCodes.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{row.ppt}</td>
                <td className="p-2 bg-gray-50">
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: row.asWas }}
                  />
                </td>
                <td className="p-2 bg-gray-50">
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: row.toBe }}
                  />
                </td>
                <td className="p-2 text-center">
                  {row.applied ? (
                    <CheckIcon className="text-green-600" />
                  ) : (
                    <CloseIcon className="text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 추출하기 버튼 */}
      <div className="flex justify-end mt-6">
        <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
          추출하기
        </button>
      </div>
    </div>
  );
};

export default Localization;
