import styled from "styled-components";
import HtmlFile from "@/assets/union.svg";

export default function UploadPreview({ fileName, uploadStatus, progress }) {
  return (
    <PreviewHeader>
      <img src={HtmlFile} alt="file-icon" />
      <div id="preview-text">
        <FileName>{fileName}</FileName>
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
        <UploadStatus $success={uploadStatus === "success"}>
          {uploadStatus === "success" ? "📂 업로드 성공!" : "❌ 업로드 실패"}
        </UploadStatus>
      </div>
    </PreviewHeader>
  );
}

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.75rem;

  #preview-text {
    font-size: 0.8rem;
    font-weight: 500;
  }

  img {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

const FileName = styled.span`
  display: inline-block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressBar = styled.div`
  width: 11.25rem;
  height: 0.125rem;
  background-color: #e5e7eb;
  border-radius: 999px;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  width: ${({ $progress }) => ($progress ? `${$progress}%` : "0%")};
  height: 100%;
  background: #5b975b;
  border-radius: 999px;
`;
const UploadStatus = styled.div`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
  width: 100%;
`;
