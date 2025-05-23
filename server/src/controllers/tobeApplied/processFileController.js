// tobe applied 실행 기능
const { replaceCode } = require('../../utils/codeUtils');

exports.processFileData = (req, res) => {
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
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "").slice(2);
    
    const formattedCountryCode = String(validCountryCode);
    const formattedticket_url = String(ticket_url).replaceAll("/", "_");
    const formattedDateStr = String(formattedDate); 
    const filename = `${formattedticket_url}_${formattedCountryCode}_to-be_${formattedDateStr}.html`;
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