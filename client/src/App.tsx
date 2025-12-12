import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as jwtDecodeLib from "jwt-decode";

import LeftNavBar from "@/Components/Nav/LeftNavBar";
import Footer from "@/Components/Nav/Footer";
import RequireAuth from "@/Components/Common/RequireAuth";

import MainScreen from "@/Pages/MainScreen";
import CodeTemplatesScreen from "@/Pages/CodeTemplates/CodeTemplatesScreen";
import ApplyCodeTemplatesScreen from "@/Pages/ApplyCodeTeamplates/ApplyCodeTemplatesScreen";
import TranslationTemplatesScreen from "@/Pages/TranslationTemplates/TranslationTemplatesScreen";
import ApplyTranslationTemplatesScreen from "@/Pages/ApplyTranslationTemplates/ApplyTranslationTemplatesScreen";
import QaScreen from "@/Pages/Qa/QaScreen";
import GuideScreen from "@/Pages/Guide/GuideScreen";
import LoginScreen from "@/Pages/Login/LoginScreen";
import RegisterScreen from "@/Pages/Register/RegisterScreen";

import "./style/global.css";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { setNameEn, setUserEmail } = useAuth();

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecodeLib.jwtDecode(token);
      console.log("[App.tsx] token 있음 O ");
      console.log("decoded user info: ", decoded);
      if (decoded?.name_en) {
        setNameEn(decoded.name_en);
      }
      if (decoded?.email) {
        setUserEmail(decoded.email);
      }
      setIsLoaded(true);
    } else {
      console.log("[App.tsx] token 없음 X");
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div>Loading...</div>
    );
  }

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