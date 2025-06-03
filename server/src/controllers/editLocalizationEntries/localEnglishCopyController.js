// // 번역 텍스트 파일에서 영어 원문만 추출
exports.extractEnglishCopyList = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // 애초에 번역 필요없는 COPY는 제외된 file을 클라이언트에서 업로드해서 이곳으로 보낸다.
    // 이곳은 COPY 열에 있는 카피텍스트를 그대로 반환해주는 것일 뿐.

    const fileContent = req.file.buffer.toString("utf-8");
    const lines = fileContent.split(/\r?\n/);

    if (lines.length < 2) {
      return res.status(400).json({ error: "File does not contain enough data." });
    }

    const headerRow = lines[0].split("\t");
    const copyColumnIndex = headerRow.findIndex((col) => col.trim().toUpperCase() === "COPY");

    if (copyColumnIndex === -1) {
      return res.status(400).json({ error: '"COPY" column not found in header.' });
    }

    const englishCopyList = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split("\t");
      const englishText = row[copyColumnIndex];

      if (englishText && englishText.trim()) {
        englishCopyList.push(englishText.trim());
      }
    }

    res.json({ englishCopyList });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
