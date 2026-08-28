import { useState } from "react";
import defaultAxios from "@/apis/defaultAxios";

export type RecoveryMode = "remove_matched" | "remove_unmatched";

export interface RecoveryReport {
  mode: RecoveryMode;
  excelCount: number;
  htmlCount: number;
  removedCount: number;
  removed: string[];
  kept: string[];
  /** Excel에서 번호를 읽은 위치 (검증용) */
  source: {
    name: string;      // "data-copy-set" | "target_selector"
    row: number;       // 헤더 행 (1-based)
    column: string;    // 엑셀 열 문자
  };
  /** 형식에 맞지 않아 건너뛴 셀 수 */
  skippedCount: number;
}

/** base64(UTF-8) 디코딩 */
const decodeBase64Utf8 = (encoded: string): string => {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
};

export const useRecovery = () => {
  const [mode, setMode] = useState<RecoveryMode>("remove_unmatched");

  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<RecoveryReport | null>(null);

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setHtmlFile(selected);
    setReport(null);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setExcelFile(selected);
    setReport(null);
  };

  const handleExecute = async () => {
    try {
      if (!excelFile) {
        alert("Excel 파일을 업로드해주세요.");
        return;
      }

      if (!htmlFile) {
        alert("HTML 파일을 업로드해주세요.");
        return;
      }

      setProcessing(true);
      setReport(null);

      const formData = new FormData();
      formData.append("excel_file", excelFile);
      formData.append("html_file", htmlFile);
      formData.append("mode", mode);

      const res = await defaultAxios.post(
        "/unpack-templates/recovery",
        formData,
        { responseType: "blob" }
      );

      // 리포트 수신
      const encoded = res.headers["x-recovery-report"];

      if (encoded) {
        try {
          setReport(JSON.parse(decodeBase64Utf8(encoded)));
        } catch (e) {
          console.error("[recovery] 리포트 파싱 실패", e);
        }
      }

      // 파일 다운로드
      const blob = new Blob([res.data], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const now = new Date();
      const dateStr =
        now.getFullYear().toString().slice(2) +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0");
      const timeStr =
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        now.getSeconds().toString().padStart(2, "0");

      const suffix = mode === "remove_matched" ? "matched" : "unmatched";
      const baseName = htmlFile.name.replace(/\.html?$/i, "");

      a.download = `${baseName}_recovery_${suffix}__${dateStr}_${timeStr}.html`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("[recovery] 실행 실패:", err);

      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          alert(json.error ?? "Recovery 처리 중 오류 발생");
          return;
        } catch {
          /* 파싱 실패 시 아래 기본 메시지 */
        }
      }

      alert("Recovery 처리 중 오류 발생");
    } finally {
      setProcessing(false);
    }
  };

  return {
    mode,
    setMode,
    htmlFile,
    excelFile,
    processing,
    report,
    handleHtmlUpload,
    handleExcelUpload,
    handleExecute,
  };
};