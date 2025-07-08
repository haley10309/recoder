// apply template 실행 기능
const { replaceCode } = require('../../utils/codeUtils');

/**
 * 현재 시간을 KST 기준으로 yyMMddHHmmss 형식으로 반환
 */
function formatDateToKST() {
  const now = new Date();

  // UTC 시간 기준에서 KST(+9시간)으로 오프셋
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstTime = new Date(utc + 9 * 60 * 60 * 1000);

  const yy = String(kstTime.getFullYear()).slice(2);
  const MM = String(kstTime.getMonth() + 1).padStart(2, "0");
  const dd = String(kstTime.getDate()).padStart(2, "0");
  const HH = String(kstTime.getHours()).padStart(2, "0");
  const mm = String(kstTime.getMinutes()).padStart(2, "0");
  const ss = String(kstTime.getSeconds()).padStart(2, "0");

  return `${yy}${MM}${dd}_${HH}${mm}${ss}`;
}

exports.convertAsWasToToBeCodes = (req, res) => {
  const codeChanges = JSON.parse(req.body.codeChanges);
  const { ticket_url, countryCode } = req.body;
  
  if (!req.file || !codeChanges || codeChanges.length === 0 || !ticket_url || !countryCode) {
    return res.status(400).json({
      success: false,
      message: "File, code pairs, product name, and country code are required.",
    });
  }

  try {
    let originalCode = req.file.buffer.toString('utf-8');
    const changeResults = [];

    codeChanges.forEach(({ asWasCode, toBeCode }, index) => {
      const { newCode, changed, matchedPart } = replaceCode(originalCode, asWasCode, toBeCode);
      changeResults.push({ pairIndex: index, changed: !!changed, matchedPart });
      if (changed) {
        originalCode = newCode;
      }
    });

    const validCountryCode = (typeof countryCode === 'string') ? countryCode : '';

    const buffer = Buffer.from(originalCode, 'utf-8');
    const formattedDateStr = formatDateToKST()
    
    const formattedCountryCode = String(validCountryCode);
    const formattedticket_url = String(ticket_url).replaceAll("/", "_");
    const filename = `${formattedticket_url}_${formattedCountryCode}_tobe_${formattedDateStr}.html`;
    const encodedFilename = encodeURIComponent(filename);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);

    res.json({
      success: true,
      changeResults,
      filename: encodedFilename,
      fileContent: buffer.toString('utf-8')
    });

  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing file.",
    });
  }
};