import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Main from "@Pages/Main";
import Create_template from "@Pages/Create_Template/Create_Template";
import ToBeApplied from "@Pages/ToBeApplied/ToBeApplied";
import Qa_page from "@Pages/Qa_Page/Qa_page";
import Footer from "@Components/Nav/Footer";
import Guide from "@Pages/Guide/Guide";
import "../src/style/global.css";
import LocalizationVersion1 from "./Pages/Localization/LocalizationVersion1";
import LeftNavBar from "@Components/Nav/LeftNavBar";

function App() {
  return (
    <>
      <RecoilRoot>
        <div className="App flex">
          <BrowserRouter>
            <div className="w-[12%]">
              <LeftNavBar />
            </div>
            <div className="w-[88%]">
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/create-template" element={<Create_template />} />
                <Route path="/tobe-applied" element={<ToBeApplied />} />
                <Route path="/qa-check" element={<Qa_page />} />
                <Route path="/guide" element={<Guide />} />
                <Route
                  path="/localizationversion1"
                  element={<LocalizationVersion1 />}
                />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
        </div>
      </RecoilRoot>
    </>
  );
}

export default App;
