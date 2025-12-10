import React from "react";
import styled from "styled-components";

const TextContainer = styled.h2`
  font-size: 15.5px;
  font-weight: bold;
  color: darkgrey;
`;

const PageDescriptionText = ({ text, style={} }) => {
  return (
    <TextContainer style={{ ...style }}>
      {text}
    </TextContainer>
  );
};

export default PageDescriptionText;
         