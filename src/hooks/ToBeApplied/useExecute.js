import { normalizeSitePath, isCodeEqual } from "@Utils/ToBeApplied/pathUtils";
import { fileExecute } from "@/apis/apis";
import { countOccurrences } from "@Utils/codeUtils";

export const useExecute = ({
  textareas,
  setTextareas,
  originalFile,
  setIsExecuted,
  setUploadProgress,
  setDownloadedFileContent,
  setDownloadedFileName,
  setUploadStatus,
  setIsProcessing,
  country_code,
  ticketUrl,
  fileContent,
  downloadedFileContent,
}) => {
  const handleChangeResults = (
    changeResults,
    fileContentParam,
    downloadedFileContentParam
  ) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } =
        changeResults.find((result) => result.pairIndex === index) || {};

      const asWasOccurrenceCount = countOccurrences(
        fileContentParam,
        textarea.asWasCode
      );
      const toBeOccurrenceCount = countOccurrences(
        downloadedFileContentParam,
        textarea.toBeCode
      );

      const lowerCaseCode = country_code?.toLowerCase?.() || "";
      const actualChanged = !isCodeEqual(
        textarea.asWasCode,
        textarea.toBeCode,
        lowerCaseCode
      );

      return {
        ...textarea,
        pptNo: textarea.pptNo,
        changed: changed || false,
        isApplied: actualChanged ? "yes" : "no",
        matchedPart,
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(
          /\/site\//g,
          `/${lowerCaseCode}/`
        ),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      };
    });

    setTextareas(updatedTextareas);
  };

  const handleExecute = async () => {
    const lowerCaseCode = country_code?.toLowerCase?.() || "";

    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      pptNo: textarea.pptNo,
      asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      changed: textarea.asWasCode !== "",
    }));

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
        .filter((textarea) => textarea.changed)
        .map((textarea) => ({
          asWasCode: textarea.asWasCode,
          toBeCode: textarea.toBeCode,
        }));

      formData.append("codePairs", JSON.stringify(codePairs));

      setIsProcessing(true);

      try {
        const progressUpdatePromise = new Promise((resolve) => {
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 100) {
                clearInterval(progressInterval);
                resolve();
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        });

        const { fileContent: newFileContent, filename } = await fileExecute(
          (changeResults) =>
            handleChangeResults(
              changeResults,
              newFileContent,
              downloadedFileContent
            ),
          setIsProcessing,
          formData,
          updatedTextareas,
          setTextareas,
          ticketUrl,
          country_code
        );

        setDownloadedFileContent(newFileContent);
        setDownloadedFileName(filename);

        await progressUpdatePromise;
        setUploadStatus("success");
      } catch (error) {
        console.error("파일 실행 오류", error);
        setUploadStatus("fail");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일 선택, asWasCode과 toBeCode 입력은 필수입니다.");
    }
  };

  return { handleExecute };
};
