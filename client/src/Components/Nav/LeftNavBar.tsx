import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

import settingIcon from "@/assets/icon/template-setting.png";
import localizationIcon from "@/assets/icon/localization.png";
import applyIcon from "@/assets/icon/template-apply.png";
import unpackIcon from "@/assets/icon/unpack.png"
import qaIcon from "@/assets/icon/qa.png";
import guideIcon from "@/assets/icon/guide.png";
import logo from "@/assets/logo.png";
import Gap from "../Common/Gap";
import { getMotivationText } from "@/utils/commonUtils";
import { useAuth } from "@/hooks/useAuth";

const LeftNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    setNameEn,
    userEmail,
    setUserEmail,
  } = useAuth();

  const [motivationText, setMotivationText] = useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setNameEn("");
    setUserEmail("");
    navigate("/");
  };

  // 이메일에서 이름 추출 (day.ahn@xxx.com → Day)
  const getDisplayName = () => {
    if (!userEmail) return "";
    const localPart = userEmail.split("@")[0]; // day.ahn
    const firstName = localPart.split(".")[0]; // day
    return firstName.charAt(0).toUpperCase() + firstName.slice(1); // Day
  };

  return (
    <NavContainer>
      <LogoContainer>
        <LogoImage
          src={logo}
          alt="logo"
          onClick={() => handleNavigate("/")}
        />
      </LogoContainer>
      <Gap gap={30} />

      {!!userEmail && (
        <>
          <NameEnContainer>
            <GreetingText>{getDisplayName()}님, 안녕하세요!</GreetingText>
            <EmailText>{userEmail}</EmailText>
          </NameEnContainer>
          <Gap gap={30} />
        </>
      )}

      <ButtonGroup>
         {/* <NavButton
          $active={location.pathname === "/" || isActive("/code-templates")}
          onClick={() => handleNavigate("/code-templates")}
        >
          <IconImage src={settingIcon} alt="As-Was/To-Be Code Templates" />
          <NavButtonText $active={location.pathname === "/" || isActive("/code-templates")}>As-Was/To-Be Code Templates</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/code-templates/apply")}
          onClick={() => handleNavigate("/code-templates/apply")}
        >
          <IconImage src={applyIcon} alt="Apply Code Templates" />
          <NavButtonText $active={isActive("/code-templates/apply")}>Apply Code Templates</NavButtonText>
        </NavButton>
        
        <NavButton
          $active={isActive("/translation-templates")}
          onClick={() => handleNavigate("/translation-templates")}
        >
          <IconImage src={localizationIcon} alt="Translation Templates" />
          <NavButtonText $active={isActive("/translation-templates")}>Translation Templates</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/translation-templates/apply")}
          onClick={() => handleNavigate("/translation-templates/apply")}
        >
          <IconImage src={applyIcon} alt="Apply Translation Templates" />
          <NavButtonText $active={isActive("/translation-templates/apply")}>Apply Translation Templates</NavButtonText>
        </NavButton> */}

        <NavButton
          $active={isActive("/unpack-templates")}
          onClick={() => handleNavigate("/unpack-templates")}
        >
          <IconImage src={unpackIcon} alt="Unpack Templates" />
          <NavButtonText $active={isActive("/unpack-templates")}>Unpack Template</NavButtonText>
        </NavButton>

         <NavButton
          $active={isActive("/unpack-templates/apply")}
          onClick={() => handleNavigate("/unpack-templates/apply")}
        >
          <IconImage src={unpackIcon} alt="Apply Unpack Templates" />
          <NavButtonText $active={isActive("/unpack-templates/apply")}>Apply Unpack Templates</NavButtonText>
        </NavButton>

        {/* <NavButton
          $active={isActive("/qa-check")}
          onClick={() => handleNavigate("/qa-check")}
        >
          <IconImage src={qaIcon} alt="QA" />
          <NavButtonText $active={isActive("/qa-check")}>QA</NavButtonText>
        </NavButton> */}

        {/* <NavButton 
          $active={isActive("/guide")}
          onClick={() => handleNavigate("/guide")}>
          <IconImage src={guideIcon} alt="guide" />
          <NavButtonText $active={isActive("/guide")}>Guide</NavButtonText>
        </NavButton> */}
      </ButtonGroup>

      {!!userEmail && (
        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      )}
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
const NameEnContainer = styled.div`
  padding: 20px 12px;
  text-align: center;
  background-color: #ffffff1a;
  border-top: 1px solid #ffffff33;
`;
const GreetingText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
`;
const EmailText = styled.div`
  font-size: 11px;
  color: #fff;
  opacity: 0.85;
  word-break: break-all;
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
const LogoutButton = styled.button`
  margin-top: auto; /* 하단 고정 */
  padding: 12px 16px;
  border: none;
  color:rgb(82, 82, 82);  /* 텍스트는 사이드바 글자색과 맞춤 */
  font-weight: 700;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    background-color: hsl(27, 80%, 65%);  /* 호버 시 약간 더 진하게 */
  }
`;