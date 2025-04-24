// 서버에서 localization list를 받아와 번역 딕셔너리를 HTML 코드에 적용
import { fetchLocalizationList } from "@/apis/apis";

export const useLocalizationApply = ({ ticketNum, ticketUrl }) => {
  const applyLocalization = async (
    textareas,
    currentTranslations,
    setTextareas
  ) => {
    try {
      const localization_list = await fetchLocalizationList(
        ticketNum,
        ticketUrl
      );
      console.log("받은 localization_list:", localization_list);

      const updated = textareas.map((textarea) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(textarea.toBeCode, "text/html");

        const walker = document.createTreeWalker(
          doc.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        while (walker.nextNode()) {
          const node = walker.currentNode;
          Object.entries(currentTranslations).forEach(([eng, loc]) => {
            if (node.nodeValue.includes(eng)) {
              node.nodeValue = node.nodeValue.replaceAll(eng, loc);
            }
          });
        }

        return { ...textarea, localizedToBeCode: doc.body.innerHTML };
      });

      setTextareas(updated);
    } catch (err) {
      console.error("로컬라이제이션 적용 실패:", err);
    }
  };

  return { applyLocalization };
};
