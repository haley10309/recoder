import { useNavigate, useLocation } from "react-router-dom";

import settingIcon from "@/assets/icon/setting-icon.svg";
import applyIcon from "@/assets/icon/apply-icon.svg";
import qaIcon from "@/assets/icon/qa-icon.svg";
import navTran from "@/assets/nav_tra.png";

import logo from "@/assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex flex-col bg-[#3B393D] text-white pt-10 text-[12px] px-2 sticky top-0 h-screen">
      <div className="flex items-center justify-center mt-10">
        <img onClick={() => handleNavigate("/tobe-applied")} className="w-[180px] hover:cursor-pointer" src={logo} alt="logo" />
      </div>

      <div className="flex flex-col gap-4 mt-10">
        <button className={`flex items-start gap-2 py-4 rounded-[5px] ${isActive("/create-template") ? "bg-[#8C8C8C] font-[500]" : "hover:bg-[#8C8C8C]"}`} onClick={() => handleNavigate("/create-template")}>
          <span className={`w-[5px] h-[100%]`} />
          <img className="w-[22px]" src={settingIcon} alt="template setting" />
          Template Setting
        </button>
        <button className={`flex items-center gap-3  py-4 rounded-[5px] ${isActive("/tobe-applied") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"}`} onClick={() => handleNavigate("/tobe-applied")}>
          <span className={`w-[5px] h-[100%]`} />
          <img className="w-[20px]" src={applyIcon} alt="template apply" />
          Template Apply
        </button>
        <button className={`flex items-center gap-3  py-4 rounded-[5px] ${isActive("/qa-check") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"}`} onClick={() => handleNavigate("/qa-check")}>
          <span className={`w-[5px] h-[100%]`} />
          <img className="w-[20px]" src={qaIcon} alt="QA" />
          QA
        </button>
        {/* <button className={`flex items-center gap-3  py-4 rounded-r-[5px] ${isActive("/translation") ? "bg-[#8C8C8C]" : "hover:bg-[#8C8C8C]"}`} onClick={() => handleNavigate("/localizationversion1")}>
          <span className={`w-[5px] h-[100%]`} />
          <img className="w-[20px]" src={navTran} alt="LocalizationVersion1" />
          Localization(1.0.0)
        </button> */}
        <button className="flex items-center justify-center font-bold py-4 rounded-[5px] bg-[#8C8C8C] hover:bg-[#8C8C8C]" onClick={() => handleNavigate("/guide")}>
          <span className={`w-[5px] h-[100%] ${isActive("/qa-check")}`} />
          Guide
        </button>
      </div>
    </nav>
  );
};

export default Header;
