import { fetchLocalizationList } from "@/apis/apis";
import {
  applyLocalizedTemplateBlocks,
  escapeRegExp,
} from "@Utils/ToBeApplied/localizationUtils";

export const useLocalization = ({
  originalFile,
  fileName,
  textareas,
  setTextareas,
  country_code,
  downloadedFileContent,
  setLocalizedFileContent,
  setLocalizedFileName,
  setIsLocalizationApplied,
  currentTranslations,
  ticketNum,
  ticketUrl,
  setUploadStatus,
}) => {
  const handleApplyLocalization = async () => {
    if (!originalFile) {
      alert("먼저 HTML 파일을 업로드하고 코드 변환을 진행해주세요.");
      return;
    }

    try {
      const localization_list = await fetchLocalizationList(
        ticketNum,
        ticketUrl
      );

      const lowerCaseCode = country_code?.toLowerCase?.() || "";

      const updatedTextareas = textareas.map((textarea) => {
        const localizedToBe = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
          currentTranslations,
          localization_list
        );

        return {
          ...textarea,
          asWasCode: textarea.asWasCode.replace(
            /\/site\//g,
            `/${lowerCaseCode}/`
          ),
          toBeCode: textarea.toBeCode.replace(
            /\/site\//g,
            `/${lowerCaseCode}/`
          ),
          localizedToBeCode: localizedToBe,
        };
      });

      // 전체 HTML에도 적용
      let localizedFullHtml = downloadedFileContent;
      localization_list.forEach((item) => {
        let originalBlock = item.local_code;
        let blockDoc = new DOMParser().parseFromString(
          originalBlock,
          "text/html"
        );
        let blockText = blockDoc.body.textContent?.trim();

        Object.entries(currentTranslations).forEach(([eng, local]) => {
          const cleanedEng = eng.trim().replace(/\s+/g, " ");
          const cleanedBlockText = blockText?.replace(/\s+/g, " ");

          if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
            const regex = new RegExp(escapeRegExp(eng), "g");
            originalBlock = originalBlock.replace(regex, local);
          }
        });

        if (localizedFullHtml.includes(item.local_code)) {
          localizedFullHtml = localizedFullHtml.replace(
            item.local_code,
            originalBlock
          );
        }
      });

      setLocalizedFileContent(localizedFullHtml);
      setLocalizedFileName(`localized_${fileName}`);
      setTextareas(updatedTextareas);
      setIsLocalizationApplied(true);
    } catch (error) {
      console.error("로컬라이제이션 적용 실패:", error);
      setUploadStatus("fail");
    }
  };

  return { handleApplyLocalization };
};
