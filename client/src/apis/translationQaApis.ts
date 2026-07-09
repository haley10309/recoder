// translation-qa: 언팩 번역이 after.html에 잘 반영됐는지 검사하는 기능.
// before.html / after.html / copy.xlsx + site_code 를 보내면 row별 검사 결과를 돌려준다.

import defaultAxios from "./defaultAxios";

export const verifyTranslationQa = async ({
  beforeFile,
  afterFile,
  excelFile,
  siteCode,
}) => {
  const formData = new FormData();
  formData.append("beforeFile", beforeFile);
  formData.append("afterFile", afterFile);
  formData.append("excelFile", excelFile);
  formData.append("site_code", siteCode);

  const res = await defaultAxios.post("/translation-qa/verify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
