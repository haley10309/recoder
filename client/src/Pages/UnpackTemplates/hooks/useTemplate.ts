import { useState } from "react";
import defaultAxios from "@/apis/defaultAxios";

export const useTemplate = () => {
  // 🔹 SKU + 작업일자
  const [sku, setSku] = useState("");
  const [workDate, setWorkDate] = useState("");

  // 🔹 상태
  const [loading, setLoading] = useState(false);

  // 🔹 템플릿 데이터
  const [localizationEntries, setLocalizationEntries] = useState<any[]>([]);

  /**
   * 공통 변환 함수 (백엔드 → 프론트)
   */
  const normalizeRow = (it: any) => ({
    id: it.id,
    target: it.target ?? it.target_selector ?? "",
    applyType: it.applyType ?? it.apply_type ?? "",
    excludeSup: Boolean(it.excludeSup ?? it.exclude_sup),
    enableTextTransform: Boolean(
      it.enableTextTransform ?? it.enable_text_transform
    ),
    copy: it.copy ?? it.original_copy ?? "",
  });

  /**
   * 템플릿 불러오기
   */
  const handleGetTemplate = async () => {
    if (!sku || !workDate) {
      alert("SKU와 작업일자를 입력해주세요.");
      return;
    }
    
    try {
      setLoading(true);

      const res = await defaultAxios.post(
        "http://localhost:5000/unpack-templates/get-details",
        {
          ticket_num: sku,
          ticket_url: workDate,
        }
      );

      const rows = Array.isArray(res.data?.row_list)
        ? res.data.row_list
        : [];

      setLocalizationEntries(rows.map(normalizeRow));

      if (rows.length > 0) {
        alert("템플릿을 불러왔습니다.");
      } else {
        alert("새로운 템플릿을 생성합니다.");
      }
    } catch (err: any) {
      const status = err.response?.status;

      // 🔹 404: 템플릿 없음 → 신규 생성 흐름
      if (status === 404) {
        setLocalizationEntries([]);
        alert("새로운 템플릿을 생성합니다.");
        return;
      }

      // 🔹 409: 중복 템플릿
      if (status === 409) {
        alert("이미 존재하는 템플릿입니다.");
        return;
      }

      // 🔹 그 외 에러
      console.error(err);
      alert("템플릿 조회 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 저장 (create + update 통합)
   */
  const handleSaveTemplate = async () => {
    if (!sku || !workDate) {
      alert("SKU와 작업일자를 입력해주세요.");
      return;
    }

    if (localizationEntries.length === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ticket_num: sku,
        ticket_url: workDate,
        row_list: localizationEntries.map((it, index) => ({
          id: it.id, // 있으면 update, 없으면 insert
          row_order: index + 1,

          target_selector: it.target,
          apply_type: it.applyType,
          exclude_sup: it.excludeSup ?? false,
          enable_text_transform: it.enableTextTransform ?? false,
          original_copy: it.copy ?? "",
        })),
      };
      
      await defaultAxios.post(
        "http://localhost:5000/unpack-templates/save",
        payload
      );

      alert("저장되었습니다.");

    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 행 삭제 (프론트에서만 제거 → 저장 시 자동 반영됨)
   */
  const handleDeleteLocalizationEntry = (index: number) => {
    setLocalizationEntries((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return {
    // 입력값
    sku,
    setSku,
    workDate,
    setWorkDate,

    // 데이터
    localizationEntries,
    setLocalizationEntries,

    // 상태
    loading,

    // 액션
    handleGetTemplate,
    handleSaveTemplate,
    handleDeleteLocalizationEntry,
  };
};