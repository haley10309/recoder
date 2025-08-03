const { extractEnglishCopyList } = require("../../utils/codeUtils");

// // 번역 텍스트 파일에서 영어 원문만 추출
exports.extractEnglishCopyList = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // 애초에 번역 필요없는 COPY는 제외된 file을 클라이언트에서 업로드해서 이곳으로 보낸다.
    // 이곳은 COPY 열에 있는 카피텍스트를 그대로 반환해주는 것일 뿐.

    const result = extractEnglishCopyList(req.file);

    console.log('extractEnglishCopyList result',result)

    if (result.error) {
      return res.status(result.statusCode).json({ error: result.errorMsg });
    }

    return res.json({ englishCopyList: result.englishCopyList });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
