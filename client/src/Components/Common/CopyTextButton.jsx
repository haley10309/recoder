import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { copyToClipboard } from "@/utils/codeUtils";

const CopiedContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(105, 105, 105);
  background-color:rgb(255, 255, 255);
  color: white;
  font-weight: 600;
  font-size: 13px;
  border-radius: 10px;
  width: 120px;
  height: 40px;
  padding: 3px 5px;
`;
const CopyCodeButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(168, 168, 168);
  background-color:rgb(255, 255, 255);
  color: white;
  font-weight: 600;
  font-size: 13px;
  border-radius: 10px;
  width: 120px;
  height: 40px;
  padding: 3px 5px;
`;

const CopyTextButton = ({ text, value, style={} }) => {
  const [copyState, setCopyState] = useState('none'); // 'none' | 'copied' | 'error'

  const hasText = typeof value === 'string' && value !== '';

  const onClick = async () => {
    let result;
    if (hasText) {
      result = await copyToClipboard(value);
    } else {
      result = await copyToClipboard('빈 문자열입니다');
    }
    setCopyState(result === true ? 'copied' : 'error');
  };

  useEffect(() => {
    if (copyState !== 'none') {
      setTimeout(() => setCopyState('none'), 350);
    }
  }, [copyState]); 

  if (!hasText) return null;

  return copyState !== 'none' ? (
    <CopiedContainer style={{
      background: copyState === 'copied' ? 'rgb(60, 185, 67)' : 'rgb(214, 47, 47)',
      borderColor: copyState !== 'none' ? "transparent" : undefined, 
      ...style,
    }}>
      <div style={{ color: "white" }}>{copyState === 'copied' ? '복사 성공' : '복사 실패'}</div>
    </CopiedContainer>
  ) : (
    <CopyCodeButton onClick={onClick} style={{ ...style }}>
      <div style={{ color: "rgb(100, 100, 100)" }}>{text}</div>
    </CopyCodeButton>
  )
};

export default CopyTextButton;