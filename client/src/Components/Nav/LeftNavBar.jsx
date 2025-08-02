import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import * as jwtDecodeLib from "jwt-decode";

import settingIcon from "@/assets/icon/template-setting.png";
import localizationIcon from "@/assets/icon/localization.png";
import applyIcon from "@/assets/icon/template-apply.png";
import qaIcon from "@/assets/icon/qa.png";
import guideIcon from "@/assets/icon/guide.png";
import logo from "@/assets/logo.png";
import Gap from "../Common/Gap";
import { getMotivationText } from "@/utils/commonUtils";
import { nameEnState } from "@/recoil/atoms/state";

const LeftNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [nameEn, setNameEn] = useRecoilState(nameEnState);
  const [motivationText, setMotivationText] = useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setNameEn("");
    navigate("/");
  };

  // useEffect(() => {
  //   if (nameEn) {
  //     const token = localStorage.getItem('authToken');
  //     if (token) {
  //       const decoded = jwtDecodeLib.jwtDecode(token);
  //       const lastLoggedInAt = decoded.last_logged_in_at;
  //       if (!motivationText) {
  //         const text = getMotivationText(new Date(lastLoggedInAt), nameEn);
  //         setMotivationText(text);
  //       }
  //     }

  //   }
  // }, [nameEn]);

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

      {!!nameEn && (
        <>
          <NameEnContainer>
            <NameText>{nameEn.charAt(0).toUpperCase() + nameEn.slice(1)}</NameText>
            <MotivationText>{motivationText}</MotivationText>
          </NameEnContainer>
          <Gap gap={30} />
        </>
      )}

      <ButtonGroup>
        <NavButton
          $active={location.pathname === "/" || isActive("/templates/form")}
          onClick={() => handleNavigate("/templates/form")}
        >
          <IconImage src={settingIcon} alt="Manage Templates" />
          <NavButtonText $active={location.pathname === "/" || isActive("/templates/form")}>Manage Templates</NavButtonText>
        </NavButton>
        
        <NavButton
          $active={isActive("/localization-entries/form")}
          onClick={() => handleNavigate("/localization-entries/form")}
        >
          <IconImage src={localizationIcon} alt="Manage Localization Entries" />
          <NavButtonText $active={isActive("/localization-entries/form")}>Manage Localization Entries</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/templates/mapping")}
          onClick={() => handleNavigate("/templates/mapping")}
        >
          <IconImage src={applyIcon} alt="Template Mapping Sitecode" />
          <NavButtonText $active={isActive("/templates/mapping")}>Template Mapping Sitecode</NavButtonText>
        </NavButton>

        <NavButton
          $active={isActive("/templates/localization")}
          onClick={() => handleNavigate("/templates/localization")}
        >
          <IconImage src={applyIcon} alt="Template Localization" />
          <NavButtonText $active={isActive("/templates/localization")}>Template Localization</NavButtonText>
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

      {!!nameEn && (
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
const NameText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
`;
const MotivationText = styled.div`
  font-size: 12px;
  color: #fff;
  opacity: 0.85;
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