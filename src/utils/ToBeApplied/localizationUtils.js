// // HTML 텍스트 매칭 및 치환 로직

// export function applyLocalizedTemplateBlocks(
//   htmlString,
//   dictionary,
//   localizationList
// ) {
//   let result = htmlString;

//   localizationList.forEach((item) => {
//     let originalBlock = item.local_code;
//     let blockDoc = new DOMParser().parseFromString(originalBlock, "text/html");
//     let blockText = blockDoc.body.textContent?.trim();

//     Object.entries(dictionary).forEach(([eng, local]) => {
//       const cleanedEng = eng.trim().replace(/\s+/g, " ");
//       const cleanedBlockText = blockText?.replace(/\s+/g, " ");

//       if (cleanedBlockText.includes(cleanedEng)) {
//         const regex = new RegExp(escapeRegExp(eng), "g");
//         originalBlock = originalBlock.replace(regex, local);
//       }
//     });

//     if (result.includes(item.local_code)) {
//       result = result.replace(item.local_code, originalBlock);
//     }
//   });

//   return result;
// }

// export function escapeRegExp(string) {
//   return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }
