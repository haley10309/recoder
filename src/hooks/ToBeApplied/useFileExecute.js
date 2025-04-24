// 백업 HTML과 번역 코드 쌍을 서버로 전송하여 변환 결과를 받아오고 상태를 업데이트
import { fileExecute } from "@/apis/apis";
import { useRecoilValue } from "recoil";
import { countryCodeState } from "@/recoil/atoms/state";

export const useFileExecute = ({
  setUploadProgress,
  setDownloadedFileContent,
  setDownloadedFileName,
  setUploadStatus,
  setIsProcessing,
}) => {
  const country_code = useRecoilValue(countryCodeState); // ✅ 최신값 안전하게 사용

  const executeFile = async ({
    originalFile,
    textareas,
    ticketUrl,
    setChangeResults,
    handleChangeResults,
    setTextareas,
    setIsExecuted,
  }) => {
    const updatedTextareas = textareas.map((textarea) => {
      const lowerCaseCode = country_code.toLowerCase();
      return {
        ...textarea,
        asWasCode: textarea.asWasCode.replace(
          /\/site\//g,
          `/${lowerCaseCode}/`
        ),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
        changed: textarea.asWasCode !== "",
      };
    });

    setTextareas(updatedTextareas);
    setIsExecuted(true);
    setUploadProgress(0);

    if (
      originalFile &&
      updatedTextareas.every(
        ({ asWasCode, toBeCode }) =>
          asWasCode && (toBeCode !== null || toBeCode === "")
      )
    ) {
      const formData = new FormData();
      formData.append("file", originalFile);
      const codePairs = updatedTextareas
        .filter((t) => t.changed)
        .map(({ asWasCode, toBeCode }) => ({ asWasCode, toBeCode }));
      formData.append("codePairs", JSON.stringify(codePairs));

      setIsProcessing(true);

      try {
        const progress = new Promise((resolve) => {
          const interval = setInterval(() => {
            setUploadProgress((p) => {
              if (p >= 100) {
                clearInterval(interval);
                resolve();
                return 100;
              }
              return p + 10;
            });
          }, 100);
        });

        const { fileContent, filename } = await fileExecute(
          setChangeResults,
          handleChangeResults,
          setIsProcessing,
          formData,
          updatedTextareas,
          setTextareas,
          ticketUrl,
          country_code
        );

        setDownloadedFileContent(fileContent);
        setDownloadedFileName(filename);
        await progress;
        setUploadStatus("success");
        console.log("✅ country_code:", country_code);
      } catch (err) {
        console.error("파일 실행 오류", err);
        setUploadStatus("fail");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일 선택과 코드 입력은 필수입니다.");
    }
  };

  return { executeFile };
};
