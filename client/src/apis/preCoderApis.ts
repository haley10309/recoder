import defaultAxios from "./defaultAxios";

export type PreCoderResultSummary = {
  id: number;
  title: string;
  html_filename: string;
  excel_filename: string;
  created_by_name: string | null;
  created_at: string;
};

export type PreCoderResultDetail = PreCoderResultSummary & {
  html_content: string;
  copy_deck_json: string;
  result_json: string;
};

export const savePreCoderResult = async ({
  title,
  htmlFile,
  excelFile,
  copyDeckJson,
  resultJson,
}: {
  title: string;
  htmlFile: File;
  excelFile: File;
  copyDeckJson: string;
  resultJson: string;
}): Promise<number> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("htmlFile", htmlFile);
  formData.append("excelFile", excelFile);
  formData.append("copyDeckJson", copyDeckJson);
  formData.append("resultJson", resultJson);

  const { data } = await defaultAxios.post("/pre-coder/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.id;
};

export const fetchPreCoderResults = async (): Promise<PreCoderResultSummary[]> => {
  const { data } = await defaultAxios.get("/pre-coder/list");
  return data?.results || [];
};

export const fetchPreCoderResultDetail = async (id: number): Promise<PreCoderResultDetail> => {
  const { data } = await defaultAxios.get(`/pre-coder/${id}`);
  return data?.result;
};

// 다운로드 라우트도 authenticate 미들웨어를 타므로, 단순 <a href>가 아니라
// axios(Authorization 헤더 자동 첨부)로 blob을 받아온 뒤 브라우저 다운로드를 트리거한다.
export const downloadPreCoderExcel = async (id: number, filename: string): Promise<void> => {
  const response = await defaultAxios.get(`/pre-coder/${id}/excel`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
