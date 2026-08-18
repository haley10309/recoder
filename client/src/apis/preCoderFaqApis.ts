import defaultAxios from "./defaultAxios";

export type FaqCopyDeckLocaleColumn = {
  code: string;
  label: string;
};

export type FaqCopyDeckRow = {
  key: string;
  category: string;
  item: string; // "Questions" | "Answer"
  copy: string;
  remark: string;
  locales: Record<string, string>;
};

export type FaqCopyDeckExtractResult = {
  rows: FaqCopyDeckRow[];
  localeColumns: FaqCopyDeckLocaleColumn[];
};

export const extractFaqCopyDeck = async (file: File): Promise<FaqCopyDeckExtractResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await defaultAxios.post("/pre-coder/faq/extract-copydeck", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    rows: data?.row_list || [],
    localeColumns: data?.locale_columns || [],
  };
};
