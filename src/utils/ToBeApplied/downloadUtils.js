export const downloadFile = (
  fileContent,
  fileName,
  fallbackName = "downloaded_file.html"
) => {
  if (!fileContent) {
    alert("다운로드할 파일이 없습니다.");
    return;
  }

  const blob = new Blob([fileContent], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
