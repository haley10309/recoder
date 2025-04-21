import React, { useState, useRef } from "react";
import styled from "styled-components";
import ArrowIcon from "@/assets/Path.svg";

const CustomDropdownInput = ({ value, onChange, placeholder, options }) => {
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef();

  const handleSelect = (val) => {
    onChange(val);
    setShowOptions(false);
  };

  return (
    <Container
      ref={containerRef}
      onBlur={() => setShowOptions(false)}
      tabIndex={0}
    >
      <InputWrapper>
        <StyledInput
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowOptions(true)}
        />
        <Arrow
          $active={showOptions}
          src={ArrowIcon}
          alt="toggle"
          onClick={() => setShowOptions((prev) => !prev)}
        />
      </InputWrapper>

      {showOptions && (
        <OptionList>
          {options
            .filter((opt) => opt.toLowerCase().includes(value.toLowerCase()))
            .map((opt, index) => (
              <Option key={index} onMouseDown={() => handleSelect(opt)}>
                {opt}
              </Option>
            ))}
        </OptionList>
      )}
    </Container>
  );
};

export default CustomDropdownInput;

const Container = styled.div`
  position: relative;
  width: 13.125rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 2.625rem;
  border-radius: 0.625rem;
  border: 1px solid #ff782f;
  background: #fff;
  box-shadow: 0px 0px 10px 0px rgba(96, 130, 228, 0.25);
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 0.875rem;
`;

const Arrow = styled.img`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%)
    rotate(${(props) => (props.$active ? "180deg" : "0deg")});
  transition: transform 0.3s ease;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const OptionList = styled.ul`
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 0.375rem;
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

const Option = styled.li`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background-color: #ffece1;
  }
`;
