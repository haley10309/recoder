// 번역 덱 적용 완료한 파일 다운 받는 api
// 사용 안함 (헤일리 버전)

const path = require("path");

exports.localResultDownloadData = (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.fileName);
  res.download(filePath, (err) => {
      if (err) {
          console.error("Error downloading file:", err);
          res.status(500).json({ success: false, message: "File download failed." });
      }
  });
};