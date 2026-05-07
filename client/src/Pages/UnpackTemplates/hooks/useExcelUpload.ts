import { useState } from "react";

export const useExcelUpload = ({ setLocalizationEntries }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExcelFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 확장자 체크
    const isExcel =
      file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isExcel) {
      alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
      return;
    }

    try {
      setLoading(true);
      setExcelFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/unpack-templates/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("엑셀 업로드 실패");
      }

      const data = await res.json();

      const mapped = data.row_list.map((row: any, index: number) => ({
        row_order: index + 1,
        target: row.target_selector,
        applyType: row.apply_type,
        excludeSup: row.exclude_sup ?? "X",
        enableTextTransform: row.enable_text_transform ?? "X",
        copy: row.original_copy ?? "",
      }));

      setLocalizationEntries(mapped);
    } catch (err) {
      console.error(err);
      alert("엑셀 처리 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return {
    excelFile,
    loading,
    handleExcelFileChange,
  };
};