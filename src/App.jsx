import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Header from "@Components/Nav/Header";
import Main from "@Pages/Main";
import Create_template from "@Pages/Create_Template/Create_Template";
import ToBeApplied from "@Pages/ToBeApplied/ToBeApplied";
import Qa_page from "@Pages/Qa_Page/Qa_page";
import Footer from "@Components/Nav/Footer";
import Guide from "@Pages/Guide/Guide";
import Translation from "@Pages/Translation/Translation";

function App() {
  return (
    <>
    <RecoilRoot>
      <div className="App flex">
          <BrowserRouter>
          <div className="w-[12%]">
            <Header />
          </div>
            <div className="w-[88%]">
              <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/create-template" element={<Create_template />} />
              <Route path="/tobe-applied" element={<ToBeApplied />} />
              <Route path="/qa-check" element={<Qa_page />} />
              <Route path="/translation" element={<Translation />} />
              <Route path="/guide" element={<Guide />} />
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
