import styled from "styled-components";
import FileUpload from "@/assets/shift-fill.svg";

export default function FileUploader({ id, label, onChange }) {
  return (
    <FileDropLabel htmlFor={id}>
      <FileDropInner>
        <img src={FileUpload} alt="upload-icon" />
        <p>{label}</p>
      </FileDropInner>
      <input id={id} type="file" onChange={onChange} hidden />
    </FileDropLabel>
  );
}

const FileDropLabel = styled.label`
  width: 20.625rem;
  height: 7.6875rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #111827;
  cursor: pointer;
`;

const FileDropInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  img {
    width: 24px;
    height: 24px;
  }

  p {
    font-size: 14px;
  }
`;
