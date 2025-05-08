import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

import settingIcon from "@/assets/icon/setting-icon.svg";
import applyIcon from "@/assets/icon/apply-icon.svg";
import qaIcon from "@/assets/icon/qa-icon.svg";
import logo from "@/assets/logo.png";

const LeftNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavContainer>
      <LogoContainer>
        <LogoImage
          src={logo}
          alt="logo"
          onClick={() => handleNavigate("/tobe-applied")}
        />
      </LogoContainer>

      <ButtonGroup>
        <NavButton
          active={isActive("/create-template")}
          onClick={() => handleNavigate("/create-template")}
        >
          <IconImage src={settingIcon} alt="template setting" />
          Template Setting
        </NavButton>

        <NavButton
          active={isActive("/tobe-applied")}
          onClick={() => handleNavigate("/tobe-applied")}
        >
          <IconImage src={applyIcon} alt="template apply" />
          Template Apply
        </NavButton>

        <NavButton
          active={isActive("/qa-check")}
          onClick={() => handleNavigate("/qa-check")}
        >
          <IconImage src={qaIcon} alt="QA" />
          QA
        </NavButton>

        <GuideButton onClick={() => handleNavigate("/guide")}>
          Guide
        </GuideButton>
      </ButtonGroup>
    </NavContainer>
  );
};

export default LeftNavBar;

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  background-color: #3b393d;
  color: white;
  padding-top: 40px;
  padding-left: 8px;
  padding-right: 8px;
  position: sticky;
  top: 0;
  height: 100vh;
  font-size: 12px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
`;

const LogoImage = styled.img`
  width: 180px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 5px;
  background-color: ${({ active }) => (active ? "#8C8C8C" : "transparent")};
  font-weight: ${({ active }) => (active ? "500" : "normal")};

  &:hover {
    background-color: #8c8c8c;
  }
`;

const IconImage = styled.img`
  width: 22px;
`;

const GuideButton = styled(NavButton)`
  justify-content: center;
  font-weight: bold;
  background-color: #8c8c8c;
`;
