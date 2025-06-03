import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as jwtDecodeLib from "jwt-decode";

import Main from "@Pages/Main";
import EditTemplate from "@/Pages/EditTemplate/EditTemplate";
import ApplyTemplate from "@Pages/ApplyTemplate/ApplyTemplate";
import Qa_page from "@Pages/Qa_Page/Qa_page";
import Footer from "@Components/Nav/Footer";
import Guide from "@Pages/Guide/Guide";
import "./style/global.css";
import LeftNavBar from "@Components/Nav/LeftNavBar";
import EditLocalizationEntries from "./Pages/EditLocalizationEntries/EditLocalizationEntries";
import Login from "./Pages/Login/Login";
import RequireAuth from "./Pages/RequireAuth";
import Register from "./Pages/Register/Register";
import { useSetRecoilState } from "recoil";
import { nameEnState } from "./recoil/atoms/state";

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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Main />
                  </RequireAuth>
                }
              />
              <Route
                path="/edit-template"
                element={
                  <RequireAuth>
                    <EditTemplate />
                  </RequireAuth>
                }
              />
              <Route
                path="/edit-localization-entries"
                element={
                  <RequireAuth>
                    <EditLocalizationEntries />
                  </RequireAuth>
                }
              />
              <Route
                path="/apply-template"
                element={
                  <RequireAuth>
                    <ApplyTemplate />
                  </RequireAuth>
                }
              />
              <Route
                path="/qa-check"
                element={
                  <RequireAuth>
                    <Qa_page />
                  </RequireAuth>
                }
              />
              <Route
                path="/guide"
                element={
                  <Guide />
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
