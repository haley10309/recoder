import { useState } from "react";
import { fetchLocalizationList } from "@/apis/apis";

export function useLocalizationApply({
  downloadedFileContent,
  fileName,
  setTextareas,
  country_code,
  currentTranslations,
}) {
  const [localizedFileContent, setLocalizedFileContent] = useState("");
  const [localizedFileName, setLocalizedFileName] = useState("");
  const [isLocalizationApplied, setIsLocalizationApplied] = useState(false);
  const [localizationStatus, setLocalizationStatus] = useState("");

  const applyLocalizedTemplateBlocks = (
    htmlString,
    dictionary,
    localizationList
  ) => {
    let result = htmlString;
    localizationList.forEach((item) => {
      let originalBlock = item.local_code;
      let blockDoc = new DOMParser().parseFromString(
        originalBlock,
        "text/html"
      );
      let blockText = blockDoc.body.textContent?.trim();

      Object.entries(dictionary).forEach(([eng, local]) => {
        const cleanedEng = eng.trim().replace(/\s+/g, " ");
        const cleanedBlockText = blockText?.replace(/\s+/g, " ");
        if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
          const regex = new RegExp(escapeRegExp(eng), "g");
          originalBlock = originalBlock.replace(regex, local);
        }
      });

      if (result.includes(item.local_code)) {
        result = result.replace(item.local_code, originalBlock);
      }
    });

    return result;
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleApplyLocalization = async (ticketNum, ticketUrl) => {
    try {
      const localization_list = await fetchLocalizationList(
        ticketNum,
        ticketUrl
      );

      const lowerCaseCode = country_code?.toLowerCase?.() || "";

      // textareas 업데이트하는 로직
      setTextareas((prev) =>
        prev.map((textarea) => {
          const localizedToBe = applyLocalizedTemplateBlocks(
            textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
            currentTranslations,
            localization_list
          );

          const errorState = Object.keys(currentTranslations).some((key) => {
            return localizedToBe.includes(key);
          });

          return {
            ...textarea,
            localizedToBeCode: localizedToBe,
            errorState,
          };
        })
      );

      // 전체 HTML 변환
      let localizedHtml = downloadedFileContent;
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

        if (localizedHtml.includes(item.local_code)) {
          localizedHtml = localizedHtml.replace(item.local_code, originalBlock);
        }
      });

      setLocalizedFileContent(localizedHtml);
      setLocalizedFileName(`localized_${fileName}`);
      setIsLocalizationApplied(true);
      setLocalizationStatus("success");
    } catch (error) {
      console.error(error);
      setLocalizationStatus("fail");
    }
  };

  return {
    localizedFileContent,
    localizedFileName,
    isLocalizationApplied,
    localizationStatus,
    handleApplyLocalization,
  };
}
