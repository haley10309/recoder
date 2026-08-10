import defaultAxios from "./defaultAxios";

export type FaqCopyDeckRow = {
  key: string;
  category: string;
  item: string; // "Questions" | "Answer"
  copy: string;
  remark: string;
};

export const extractFaqCopyDeck = async (file: File): Promise<FaqCopyDeckRow[]> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await defaultAxios.post("/pre-coder/faq/extract-copydeck", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.row_list || [];
};
