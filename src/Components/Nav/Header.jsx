import mainLogo from "../../assets/ptk_logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <nav className="text-center align-center items-center flex bg-[#24242c] text-white px-10 justify-between">
      <img
        onClick={() => handleNavigate("/tobe-applied")}
        className="w-[180px] hover:cursor-pointer"
        src={mainLogo}
        alt="logo"
      />
      <div className="text-[12px] flex justify-between gap-10">
        <p
          onClick={() => handleNavigate("/create-template")}
          className="hover:cursor-pointer"
        >
          템플릿 세팅 페이지
        </p>
        <p
          onClick={() => handleNavigate("/tobe-applied")}
          className="hover:cursor-pointer"
        >
          To-be 소스 적용 페이지
        </p>
        <p
          onClick={() => handleNavigate("/qa-check")}
          className="hover:cursor-pointer"
        >
          QA 페이지
        </p>
      </div>
    </nav>
  );
};

export default Header;
