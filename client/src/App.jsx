import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Main from "@Pages/Main";
import EditTemplate from "@/Pages/EditTemplate/EditTemplate";
import ToBeApplied from "@Pages/ToBeApplied/ToBeApplied";
import Qa_page from "@Pages/Qa_Page/Qa_page";
import Footer from "@Components/Nav/Footer";
import Guide from "@Pages/Guide/Guide";
import "./style/global.css";
import LocalizationVersion1 from "./Pages/Localization/LocalizationVersion1";
import LeftNavBar from "@Components/Nav/LeftNavBar";
import Localization from "./Pages/Localization/Localization";

function App() {
  return (
    <>
      <RecoilRoot>
        <div className="App flex">
          <BrowserRouter>
            <div className="w-[18%]">
              <LeftNavBar />
            </div>
            <div className="w-[82%]">
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/edit-template" element={<EditTemplate />} />
                <Route path="/localize-template" element={<Localization />} />
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
