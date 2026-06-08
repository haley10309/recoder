import { useState } from "react";
import defaultAxios from "@/apis/defaultAxios";

interface UseLocalizationApplyProps {
  tobeHtmlFile: File | null;

  textareas: any[];
  setTextareas: React.Dispatch<React.SetStateAction<any[]>>;

  workDate: string;
  sku: string;
  countryCode: string;
}

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
  const [isLocalizationApplied, setIsLocalizationApplied] =
    useState(false);

  const [localizationStatus, setLocalizationStatus] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

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
        row_list: textareas.map((it, index) => ({
          id: it.id,
          row_order: it.rowOrder ?? index + 1,

          target_selector: it.target,
          apply_type: it.applyType,

          exclude_sup: it.excludeSup ?? false,

          enable_text_transform:
            it.enableTextTransform ?? false,

          original_copy:
            it.originalCopy || "",

          translated_copy:
            it.deckCopy || "",
        })),
      };

      const { data } = await defaultAxios.post(
        "/unpack-templates/process-copy",
        payload
      );

      const processedRows =
        data?.row_list || [];

      setTextareas((prev) =>
        prev.map((item) => {
          const matched =
            processedRows.find(
              (r: any) => r.id === item.id
            );

          if (!matched) return item;

          return {
            ...item,

            appliedCopy:
              matched.processed_translated_copy || "",
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
  // Localization 적용
  // =========================
  const handleApplyLocalization = async () => {
    try {
      if (textareas.length === 0) {
        alert("적용할 데이터가 없습니다.");
        return;
      }

      setLocalizationStatus(
        "Localization 적용 완료"
      );

      setIsLocalizationApplied(true);

    } catch (err) {
      console.error(err);

      alert(
        "Localization 적용 중 오류 발생"
      );
    }
  };

  // =========================
  // HTML 다운로드
  // =========================
  const handleLocalizedDownload =
    async () => {
      try {
        if (!tobeHtmlFile) {
          alert(
            "HTML 파일을 업로드해주세요."
          );
          return;
        }

        if (textareas.length === 0) {
          alert(
            "적용할 템플릿이 없습니다."
          );
          return;
        }

        setDownloading(true);

        const formData = new FormData();

        // 🔥 html 파일
        formData.append(
          "file",
          tobeHtmlFile
        );

        // 🔥 row_list
        formData.append(
          "row_list",
          JSON.stringify(
            textareas.map(
              (it, index) => ({
                id: it.id,

                row_order:
                  it.rowOrder ??
                  index + 1,

                target_selector:
                  it.target,

                apply_type:
                  it.applyType,

                exclude_sup:
                  it.excludeSup ??
                  false,

                enable_text_transform:
                  it.enableTextTransform ??
                  false,

                translated_copy:
                  it.deckCopy || "",

                processed_translated_copy:
                  it.appliedCopy ||
                  "",
              })
            )
          )
        );

        const res =
          await defaultAxios.post(
            "/unpack-templates/apply-to-html",
            formData,
            {
              responseType: "blob",

              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        // =========================
        // 파일 다운로드
        // =========================
        const blob = new Blob(
          [res.data],
          {
            type: "text/html",
          }
        );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const a =
          document.createElement("a");

        a.href = url;

        const now = new Date();
        const dateStr = now.getFullYear().toString().slice(2)
                      + (now.getMonth() + 1).toString().padStart(2, '0')
                      + now.getDate().toString().padStart(2, '0');
        const timeStr = now.getHours().toString().padStart(2, '0')
                      + now.getMinutes().toString().padStart(2, '0')
                      + now.getSeconds().toString().padStart(2, '0');

        a.download = `${workDate}_${sku}_${countryCode}__${dateStr}_${timeStr}.html`;

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);

      } catch (err) {
        console.error(err);

        alert(
          "HTML 다운로드 중 오류 발생"
        );
      } finally {
        setDownloading(false);
      }
    };

  return {
    // 상태
    processing,
    downloading,

    localizationStatus,
    isLocalizationApplied,

    // 액션
    handleProcessCopy,
    handleApplyLocalization,
    handleLocalizedDownload,
  };
};