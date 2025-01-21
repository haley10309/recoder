import Yes from '../../assets/tobe_yes.png';
import No from '../../assets/tobe_no.png';
import Delete from '../../assets/mi_delete.svg';
import NoValuePage from "../../Pages/ToBeApplied/NoValuePage";
import { countOccurrences } from "../../Pages/utils/codeUtils";

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, changed, fileContent, onDelete }) => {
  const handleDeleteClick = () => {
    if (window.confirm("해당 항목을 삭제하시겠습니까?")) {
      onDelete();
    }
  };
  const occurrences = countOccurrences(fileContent, asWasCode);
  return (
    <div className="flex items-center justify-between px-20 py-10 font-medium">
      <h2 className="flex justify-center w-[12.5%] text-black text-[14px]">
        Slide &nbsp;<span className="font-bold">p.{pptNo}</span>
      </h2>
      <button className="flex justify-center w-[6.25%]" onClick={handleDeleteClick}>
        <div className="flex justify-center p-2 rounded-xl">
          <img fill="#FF4747" className="w-10 h-10" src={Delete} alt="Delete image" />
        </div>
      </button>
      <div className='w-[31%] h-[230px]  resize-none p-4'>
        <textarea
                className="flex justify-center w-[100%] h-[100%] bg-[#D9D9D9] resize-none p-0"
                value={asWasCode || ""}
                onChange={(e) => setAsWasCode(e.target.value)}
                placeholder="As-Was code를 입력하세요."
              />
          <div className="duplicate-count">이 코드가 포함된 횟수: {occurrences}</div>
      </div>
      
      <textarea
        value={toBeCode || ""}
        className="flex justify-center w-[30%] h-[200px] bg-[#D9D9D9] resize-none p-4"
        onChange={(e) => setToBeCode(e.target.value)}
        placeholder="To-Be code를 입력하세요."
      />
      <div className="flex justify-center w-[18.75%]">
        {changed?.changed === true ? (
          <img className="w-[50px] h-[50px]" src={Yes} alt="yes" />
        ) : (
          <img className="w-[50px] h-[50px]" src={No} alt="no" />
        )}
      </div>
    </div>
  );
};

export default BasicTextarea;
