import Yes from '../../assets/tobe_yes.png';
import No from '../../assets/tobe_no.png';
import NoValuePage from "../../Pages/ToBeApplied/NoValuePage";

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, checked, onCheckedChange, filter }) => {
  const isEmpty = !pptNo && !asWasCode && !toBeCode;

  const isCheckboxDisabled = filter === "checked" || filter === "unchecked";
  
  return (
    <div>
      {isEmpty ? (
        <NoValuePage />
      ) : (
        <>          
          <div className="flex items-center justify-between px-20 py-10 font-medium">
            <div className='w-[12.5%] flex justify-center'>
              <input
                type="checkbox"
                checked={checked}
                onChange={onCheckedChange}
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={isCheckboxDisabled}
              />
            </div>
            <h2 className='flex justify-center w-[6.25%] text-black text-[14px]'>
              <span className='font-bold'>p.{pptNo}</span>
            </h2>
            <textarea
              className="flex justify-center w-[28%] h-[200px] bg-[#D9D9D9] resize-none p-4"
              value={asWasCode}
              onChange={(e) => setAsWasCode(e.target.value)}
              placeholder="As-Was code를 입력하세요."
            />
            <textarea
              value={toBeCode}
              className="flex justify-center w-[28%] h-[200px] bg-[#D9D9D9] resize-none p-4"
              onChange={(e) => setToBeCode(e.target.value)}
              placeholder="To-Be code를 입력하세요."
            />
          </div>
        </>
      )}
    </div>
  );
};


export default BasicTextarea;