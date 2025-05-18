import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

import settingIcon from "@/assets/icon/template-setting.png";
import localizationIcon from "@/assets/icon/localization.png";
import applyIcon from "@/assets/icon/template-apply.png";
import qaIcon from "@/assets/icon/qa.png";
import guideIcon from "@/assets/icon/guide.png";
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
          onClick={() => handleNavigate("/")}
        />
      </LogoContainer>

      <ButtonGroup>
        <NavButton
          $active={location.pathname === "/" || isActive("/edit-template")}
          onClick={() => handleNavigate("/edit-template")}
        >
          <IconImage src={settingIcon} alt="edit template" />
          <NavButtonText $active={location.pathname === "/" || isActive("/edit-template")}>Edit Template</NavButtonText>
        </NavButton>
        
        <NavButton
        // TODO: 이름 어울리게 네이밍
          $active={isActive("/localize-template")}
          onClick={() => handleNavigate("/localize-template")}
        >
          <IconImage src={localizationIcon} alt="localize template" />
          <NavButtonText $active={isActive("/localize-template")}>Localize Template</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/tobe-applied")}
          onClick={() => handleNavigate("/tobe-applied")}
        >
          <IconImage src={applyIcon} alt="apply template" />
          <NavButtonText $active={isActive("/tobe-applied")}>Apply Template</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/qa-check")}
          onClick={() => handleNavigate("/qa-check")}
        >
          <IconImage src={qaIcon} alt="QA" />
          <NavButtonText $active={isActive("/qa-check")}>QA</NavButtonText>
        </NavButton>

        <NavButton 
          $active={isActive("/guide")}
          onClick={() => handleNavigate("/guide")}>
          <IconImage src={guideIcon} alt="guide" />
          <NavButtonText $active={isActive("/guide")}>Guide</NavButtonText>
          </NavButton>
      </ButtonGroup>
    </NavContainer>
  );
};

export default LeftNavBar;

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  background-color: hsl(27, 100.00%, 80.40%);
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
  background-color: ${(props) => (props.$active ? "hsl(27, 90%, 70%)" : "transparent")};
  font-weight: ${(props) => (props.$active ? "700" : "normal")};

  &:hover {
    background-color: hsl(27, 90%, 70%);
  }
`;
const NavButtonText = styled.div`
  color: #4B1C2F ;
  font-size: 14px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: ${(props) => (props.$active ? "700" : "normal")};
`;

const IconImage = styled.img`
  width: 24px;
`;
