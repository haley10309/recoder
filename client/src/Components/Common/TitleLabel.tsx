import React from "react";
import styled from "styled-components";

const TextContainer = styled.h2`
  font-size: 16px;
  font-weight: bold;
  color: black;
`;

const TitleLabel = ({ text, style={} }) => {
  return (
    <TextContainer style={{ ...style }}>
      {text}
    </TextContainer>
  );
};

export default TitleLabel;
