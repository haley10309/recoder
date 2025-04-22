import mainLogo from "@/assets/ptk_logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import navTemplate from "@/assets/nav_template.png";
import navApply from "@/assets/nav_apply.png";
import navQa from "@/assets/nav_qa.png";
import navTran from "@/assets/nav_tra.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex flex-col bg-[#3B393D] text-white pt-10 text-[12px] px-2 sticky top-0 h-screen">
      <div className="flex items-center pb-5 justify-center">
        <img
          onClick={() => handleNavigate("/tobe-applied")}
          className="w-[180px] hover:cursor-pointer"
          src={mainLogo}
          alt="logo"
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          className={`flex items-start gap-2 py-4 rounded-r-[5px] ${
            isActive("/create-template")
              ? "bg-[#8C8C8C] font-[500]"
              : "hover:bg-[#8C8C8C]"
          }`}
          onClick={() => handleNavigate("/create-template")}
        >
          <span
            className={`w-[5px] h-[100%] ${
              isActive("/create-template") ? "bg-blue-500" : ""
            }`}
          />
          <img className="w-[22px]" src={navTemplate} alt="Template" />
          Template Setting
        </button>
        <button
          className={`flex items-center gap-3  py-4 rounded-r-[5px] ${
            isActive("/tobe-applied") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"
          }`}
          onClick={() => handleNavigate("/tobe-applied")}
        >
          <span
            className={`w-[5px] h-[100%] ${
              isActive("/tobe-applied") ? "bg-blue-500" : ""
            }`}
          />
          <img className="w-[20px]" src={navApply} alt="Apply" />
          Template Apply
        </button>
        <button
          className={`flex items-center gap-3  py-4 rounded-r-[5px] ${
            isActive("/qa-check") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"
          }`}
          onClick={() => handleNavigate("/qa-check")}
        >
          <span
            className={`w-[5px] h-[100%]  ${
              isActive("/qa-check") ? "bg-blue-500" : ""
            }`}
          />
          <img className="w-[20px]" src={navQa} alt="QA" />
          QA
        </button>
        <button
          className={`flex items-center gap-3  py-4 rounded-r-[5px] ${
            isActive("/translation") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"
          }`}
          onClick={() => handleNavigate("/localizationversion1")}
        >
          <span
            className={`w-[5px] h-[100%]  ${
              isActive("/localizationversion1") ? "bg-blue-500" : ""
            }`}
          />
          <img className="w-[20px]" src={navTran} alt="LocalizationVersion1" />
          Localization(1.0.0)
        </button>
        <button
          className="flex items-center justify-center font-bold py-4 rounded-[5px] bg-[#8C8C8C] hover:bg-[#8C8C8C]"
          onClick={() => handleNavigate("/guide")}
        >
          <span className={`w-[5px] h-[100%] ${isActive("/qa-check")}`} />
          Guide
        </button>
      </div>
    </nav>
  );
};

export default Header;
