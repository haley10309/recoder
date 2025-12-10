import React from "react";
import styled from "styled-components";

const Container = styled.div`
  height: ${props => props.$customGap}px;
`;

const Gap = ({ gap }) => {
  return (
    <Container $customGap={gap} />
  );
};

export default Gap;
