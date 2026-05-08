import { useState, useEffect } from "react";
import { parseExcelFile } from "@/apis/apis";

export function useExcelUpload({
  countryCode,
  setEnglishCopyList,
}) {
  const [rows, setRows] = useState([]);
  const [translationMap, setTranslationMap] = useState({});

  const [excelUploadStatus, setExcelUploadStatus] = useState("");
  const [excelFileName, setExcelFileName] = useState("");
  const [excelUploadProgress, setExcelUploadProgress] = useState(0);
  const [excelFile, setExcelFile] = useState(null);

  /**
   * 🔥 translated_copy 파싱
   * 예: "ko:안녕|en:Hello|ja:こんにちは"
   */
  const parseTranslatedCopy = (str) => {
    const map = {};
    if (!str) return map;

    str.split("|").forEach((pair) => {
      const [key, value] = pair.split(":");
      if (key && value) {
        map[key.trim()] = value.trim();
      }
    });

    return map;
  };

  /**
   * 🔥 translationMap 생성
   */
  const buildTranslationMap = (rows, country) => {
    const _map = {};

    rows.forEach((row) => {
      const key = row.original_copy?.trim();
      const parsed = parseTranslatedCopy(row.translated_copy);
      const value = parsed[country];

      if (key && value && key !== value) {
        _map[key] = value;
      }
    });

    setTranslationMap(_map);
  };

  /**
   * 🔥 엑셀 업로드
   */
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setExcelUploadStatus("fail");
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      setExcelUploadStatus("fail");
      return;
    }

    const reader = new FileReader();

    reader.onloadstart = () => setExcelUploadProgress(0);

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setExcelUploadProgress(percent);
      }
    };

    reader.onload = async () => {
      setExcelUploadProgress(100);

      try {
        setExcelFile(file);

        const unpackRows = await parseExcelFile(file);
        setRows(unpackRows);

        // 🔥 englishCopyList (highlight용)
        const englishCopyList = unpackRows
          .map((row) => row.original_copy?.trim())
          .filter(Boolean);

        setEnglishCopyList(englishCopyList);

        setExcelFileName(file.name);
        setExcelUploadStatus("success");

        // 🔥 최초 map 생성
        buildTranslationMap(unpackRows, countryCode);
      } catch (err) {
        console.error(err);
        setExcelUploadStatus("fail");
      }
    };

    reader.onerror = () => {
      setExcelUploadStatus("fail");
    };

    reader.readAsArrayBuffer(file);
  };

  /**
   * 🔥 국가 변경 시 자동 반영
   */
  useEffect(() => {
    if (!rows.length || !countryCode) return;
    buildTranslationMap(rows, countryCode);
  }, [countryCode, rows]);

  return {
    rows,                // 👉 UI 카드/테이블 생성용
    translationMap,      // 👉 적용용
    excelUploadStatus,
    excelFileName,
    excelUploadProgress,
    handleExcelUpload,
    excelFile,
  };
}