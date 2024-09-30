import { useState } from "react";
import "./Input_Project.scss";
import CheckIcon from "@mui/icons-material/Check";

const Input_Project = ({ projectName, setProjectName }) => {
  return (
    <div className="project_segmented_button">
      <div className="segment-start">
        <div className="container">
          <div className="state-layer">
            <CheckIcon className="check-icon" />
            <div className="label-text">프로젝트</div>
          </div>
        </div>
      </div>
      <div className="segment-end">
        <div className="container2">
          <textarea
            className="text-area"
            placeholder="ex) Hotfix 1.0"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value); // 상위 컴포넌트의 상태 업데이트
            }}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Input_Project;
