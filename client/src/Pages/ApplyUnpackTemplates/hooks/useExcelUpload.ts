import { useState, useEffect } from "react";
import { parseExcelFile } from "@/apis/apis";

export function useExcelUpload({
  countryCode,
  setEnglishCopyList,
}) {
  const [rows, setRows] = useState([]);
  const [translationMap, setTranslationMap] = useState({});
  
  const [excelUploadStatus, setExcelUploadStatus] = useState<string | null>(null);
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

    // 확장자 체크
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      setExcelUploadStatus("fail");
      return;
    }

    // 상태 초기화
    setExcelUploadStatus(null);
    setExcelUploadProgress(0);

    const reader = new FileReader();

    // 파일 읽기 시작
    reader.onloadstart = () => {
      setExcelUploadProgress(10);
    };

    // 파일 읽는 중
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        // 파일 읽기 단계는 최대 70%까지만 사용
        const percent = Math.round((event.loaded / event.total) * 70);

        setExcelUploadProgress(percent);
      }
    };

    // 파일 읽기 완료
    reader.onload = async () => {
      try {
        // 파일 읽기 완료
        setExcelUploadProgress(70);

        setExcelFile(file);

        // 실제 파싱 처리
        const unpackRows = await parseExcelFile(file);

        // 파싱 완료 직전
        setExcelUploadProgress(90);

        setRows(unpackRows);

        // highlight용 english copy list
        const englishCopyList = unpackRows
          .map((row) => row.original_copy?.trim())
          .filter(Boolean);

        setEnglishCopyList(englishCopyList);

        // translation map 생성
        buildTranslationMap(unpackRows, countryCode);

        setExcelFileName(file.name);

        // 최종 완료
        setExcelUploadProgress(100);

        // 약간의 텀 후 성공 표시 (선택사항)
        setTimeout(() => {
          setExcelUploadStatus("success");
        }, 200);

      } catch (err) {
        console.error(err);

        setExcelUploadStatus("fail");
        setExcelUploadProgress(0);
      }
    };

    reader.onerror = () => {
      setExcelUploadStatus("fail");
      setExcelUploadProgress(0);
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