import { useState } from "react";
import defaultAxios from "@/apis/defaultAxios";

export type ReportStatus = "success" | "warning" | "error";

export interface ReportEntry {
  status: ReportStatus;
  schemaType: string;
  index: number;
  field: string;
  before?: string;
  after?: string;
  message?: string;
}

export interface SchemaReport {
  countryCode: string;
  locale: string;
  entries: ReportEntry[];
  totalTargets: number;
  replacedCount: number;
  warningCount: number;
  errorCount: number;
}

interface UseLocalizationApplyProps {
  tobeHtmlFile: File | null;

  textareas: any[];
  setTextareas: React.Dispatch<React.SetStateAction<any[]>>;

  workDate: string;
  sku: string;
  countryCode: string;
}

/** base64(UTF-8) 디코딩 */
const decodeBase64Utf8 = (encoded: string): string => {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
};

/** row_list payload 공통 매핑 */
const toRowPayload = (it: any, index: number) => ({
  id: it.id,
  row_order: it.rowOrder ?? index + 1,

  key: it.key ?? "",
  target_selector: it.target,
  apply_type: it.applyType,

  exclude_sup: it.excludeSup ?? false,
  enable_text_transform: it.enableTextTransform ?? false,

  original_copy: it.originalCopy || "",
  translated_copy: it.deckCopy || "",
});

export const useLocalizationApply = ({
  tobeHtmlFile,
  textareas,
  setTextareas,
  workDate,
  sku,
  countryCode,
}: UseLocalizationApplyProps) => {
  // =========================
  // 상태
  // =========================
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [schemaReport, setSchemaReport] = useState<SchemaReport | null>(null);

  // =========================
  // Copy 가공 API
  // =========================
  const handleProcessCopy = async () => {
    try {
      if (textareas.length === 0) {
        alert("가공할 데이터가 없습니다.");
        return;
      }

      setProcessing(true);

      const payload = {
        row_list: textareas.map(toRowPayload),
      };

      const { data } = await defaultAxios.post(
        "/unpack-templates/process-copy",
        payload
      );

      const processedRows = data?.row_list || [];

      // id 기준 조회용 Map
      const processedMap = new Map(
        processedRows.map((r: any) => [r.id, r])
      );

      if (processedMap.size !== processedRows.length) {
        console.warn(
          "row_list에 중복되거나 비어 있는 id가 있습니다. 가공 결과가 잘못 매칭될 수 있습니다."
        );
      }

      setTextareas((prev) =>
        prev.map((item) => {
          const matched: any = processedMap.get(item.id);

          // 매칭 실패 시 이전 실행의 가공값이 남지 않도록 초기화
          if (!matched) {
            return { ...item, appliedCopy: "" };
          }

          return {
            ...item,
            appliedCopy: matched.processed_translated_copy || "",
          };
        })
      );

      alert("Copy 가공 완료");
    } catch (err) {
      console.error(err);
      alert("Copy 가공 중 오류 발생");
    } finally {
      setProcessing(false);
    }
  };

  // =========================
  // HTML 다운로드
  // =========================
  const handleLocalizedDownload = async () => {
    try {
      if (!tobeHtmlFile) {
        alert("HTML 파일을 업로드해주세요.");
        return;
      }

      if (textareas.length === 0) {
        alert("적용할 템플릿이 없습니다.");
        return;
      }

      setDownloading(true);
      setSchemaReport(null);

      const formData = new FormData();

      formData.append("file", tobeHtmlFile);

      // Schema 치환 시 inLanguage 값 도출에 사용
      formData.append("country_code", countryCode);

      formData.append(
        "row_list",
        JSON.stringify(
          textareas.map((it, index) => ({
            ...toRowPayload(it, index),
            processed_translated_copy: it.appliedCopy || "",
          }))
        )
      );

      const res = await defaultAxios.post(
        "/unpack-templates/apply-to-html",
        formData,
        { responseType: "blob" }
      );

      // =========================
      // Schema 리포트 수신
      // =========================
      const encoded = res.headers["x-schema-report"];

      if (encoded) {
        try {
          setSchemaReport(JSON.parse(decodeBase64Utf8(encoded)));
        } catch (e) {
          console.error("Schema 리포트 파싱 실패", e);
        }
      }

      // =========================
      // 파일 다운로드
      // =========================
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

      a.download = `${workDate}_${sku}_${countryCode}__${dateStr}_${timeStr}.html`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);

      // blob 응답 안의 에러 메시지를 풀어서 표시
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          alert(json.error ?? "HTML 다운로드 중 오류 발생");
          return;
        } catch {
          /* 파싱 실패 시 아래 기본 메시지 */
        }
      }

      alert("HTML 다운로드 중 오류 발생");
    } finally {
      setDownloading(false);
    }
  };

  return {
    // 상태
    processing,
    downloading,
    schemaReport,

    // 액션
    handleProcessCopy,
    handleLocalizedDownload,
  };
};