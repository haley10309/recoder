// 번역 기능 - 사용 안함 (리나 버전)

const db = require("../../config/db");
const fs = require("fs");

function normalizeForComparison(str) {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, '');
}

const stripHtmlTags = (str) => str.replace(/<[^>]+>/g, '').trim();
const clean = (s) => normalizeForComparison(s).replace(/["'\[\]\-·*]/g, '');

exports.translateHtmlWithTxt = (req, res) => {
  const { hotfix_id, country_code } = req.body;
  const htmlFile = req.files?.file?.[0];
  const txtFile = req.files?.txtfile?.[0];

  if (!htmlFile || !txtFile || !hotfix_id || !country_code) {
    return res.status(400).json({ success: false, message: "파일 또는 필수 정보가 누락되었습니다." });
  }

  try {
    const htmlContentRaw = htmlFile.buffer.toString("utf-8");
    let htmlContent = htmlContentRaw;
    const normalizedHtml = normalizeForComparison(htmlContentRaw);

    const txtContent = txtFile.buffer.toString("utf-8");
    const lines = txtContent.split(/\r?\n/);
    if (lines.length < 2) return res.status(400).json({ error: "번역 텍스트 파일에 데이터가 없습니다." });

    const headers = lines[0].split("\t");
    const countryCodes = headers.slice(1);
    const englishCopy = [];
    const translations = {};
    countryCodes.forEach(code => translations[code] = []);

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split("\t");
      const englishText = row[0];
      if (!englishText) continue;
      englishCopy.push(englishText);
      for (let j = 1; j < row.length; j++) {
        const cc = countryCodes[j - 1];
        const value = row[j]?.trim();
        translations[cc]?.push(value || '');
      }
    }

    const query = "SELECT id, local_code FROM localization WHERE hotfix_id = ?";
    db.query(query, [hotfix_id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: "DB 조회 실패", error: err });
      }

      const matches = [];
      const replacedResults = [];

      results.forEach(({ id, local_code }) => {
        const normalizedCode = normalizeForComparison(local_code);
        const matched = normalizedHtml.includes(normalizedCode);

        let htmlMatchedPart = null;
        let context = null;

        if (matched) {
          const rawCode = local_code
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\');

          const startIndex = htmlContent.indexOf(rawCode);
          if (startIndex !== -1) {
            htmlMatchedPart = htmlContent.slice(startIndex, startIndex + rawCode.length);
            const contextStart = Math.max(0, startIndex - 100);
            const contextEnd = startIndex + rawCode.length + 100;
            context = htmlContent.slice(contextStart, contextEnd);

            matches.push({ id, matched, htmlMatchedPart, context });

            const innerText = stripHtmlTags(htmlMatchedPart);

            const matchIndex = englishCopy.findIndex(copy => clean(innerText).includes(clean(copy)));

            console.log("innerText:", JSON.stringify(innerText));
            console.log("englishCopy", englishCopy.map(c => JSON.stringify(c)));
            console.log("matchIndex:", matchIndex);
            console.log("번역어:", translations[country_code]?.[matchIndex]);

            const originalEnglish = englishCopy[matchIndex];
            const translated = translations[country_code]?.[matchIndex];

            if (matchIndex !== -1 && translated && translated !== '#N/A') {
              const safeOriginal = originalEnglish.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
              const regex = new RegExp(safeOriginal, 'g');
            
              const translatedPart = htmlMatchedPart.replace(regex, translated); 
              htmlContent = htmlContent.replace(htmlMatchedPart, translatedPart);
            
              replacedResults.push({
                id,
                original: htmlMatchedPart,
                replaced: translatedPart,
                index: matchIndex
              });
            }
          }
        } else {
          matches.push({ id, matched, htmlMatchedPart, context });
        }
      });

      return res.json({
        success: true,
        total: matches.length,
        matchedCount: matches.filter(m => m.matched).length,
        matches,
        replacedCount: replacedResults.length,
        replacedResults,
        updatedHtml: htmlContent
      });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "파일 처리 오류", error: err.message });
  }
};
