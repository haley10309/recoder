import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as jwtDecodeLib from "jwt-decode";

import MainScreen from "@/Pages/MainScreen";
import CodeTemplatesScreen from "@/Pages/CodeTemplates/CodeTemplatesScreen";
import ApplyCodeTemplatesScreen from "@/Pages/ApplyCodeTeamplates/ApplyCodeTemplatesScreen";
import QaScreen from "@/Pages/Qa/QaScreen";
import Footer from "@Components/Nav/Footer";
import GuideScreen from "@/Pages/Guide/GuideScreen";
import "./style/global.css";
import LeftNavBar from "@Components/Nav/LeftNavBar";
import TranslationTemplatesScreen from "./Pages/TranslationTemplates/TranslationTemplatesScreen";
import LoginScreen from "./Pages/Login/LoginScreen";
import RequireAuth from "./Pages/RequireAuth";
import RegisterScreen from "./Pages/Register/RegisterScreen";
import { useSetRecoilState } from "recoil";
import { nameEnState } from "./recoil/atoms/state";
import ApplyTranslationTemplatesScreen from "./Pages/ApplyTranslationTemplates/ApplyTranslationTemplatesScreen";

function App() {
  const setNameEn = useSetRecoilState(nameEnState);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecodeLib.jwtDecode(token);
      if (decoded?.name_en) {
        setNameEn(decoded.name_en);
      }
    }
  }, []);


  return (
    <>
      <div className="App flex">
        <BrowserRouter>
          <div className="w-[18%]">
            <LeftNavBar />
          </div>
          <div className="w-[82%]">
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <MainScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/code-templates"
                element={
                  <RequireAuth>
                    <CodeTemplatesScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/code-templates/apply"
                element={
                  <RequireAuth>
                    <ApplyCodeTemplatesScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/translation-templates"
                element={
                  <RequireAuth>
                    <TranslationTemplatesScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/translation-templates/apply"
                element={
                  <RequireAuth>
                    <ApplyTranslationTemplatesScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/qa-check"
                element={
                  <RequireAuth>
                    <QaScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/guide"
                element={
                  <GuideScreen />
                }
              />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
