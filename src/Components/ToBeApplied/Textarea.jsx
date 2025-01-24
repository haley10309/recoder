import Yes from '../../assets/tobe_yes.png';
import No from '../../assets/tobe_no.png';
import NoValuePage from "../../Pages/ToBeApplied/NoValuePage";

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, isApplied, checked, onCheckedChange, filter, country_code }) => {
  const isEmpty = !pptNo && !asWasCode && !toBeCode;

  const isCheckboxDisabled = filter === "checked" || filter === "unchecked";

  const transformedAsWasCode = asWasCode?.replace(/\/site\//g, `/${country_code}/`);
  const transformedToBeCode = toBeCode?.replace(/\/site\//g, `/${country_code}/`);
  
  return (
    <div>
      {isEmpty ? (
        <NoValuePage />
      ) : (
        <>    
          <div className="flex items-center justify-between p-4 bg-[#f6f6f6] border-b border-gray-300">
            {/* Checkbox */}
            <div className="flex justify-center w-[12.5%] pr-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={onCheckedChange}
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={isCheckboxDisabled}
              />
            </div>

            {/* PPT No. */}
            <h2 className='flex justify-center w-[12.5%] text-black text-[14px] pr-4'>
              <span className='font-bold'>p.{pptNo}</span>
            </h2>

            {/* As-Was Code */}
            <textarea
              className="w-[28%] h-[150px] bg-[#D9D9D9] resize-none p-4 border border-gray-300 rounded"
              value={transformedAsWasCode}
              onChange={(e) => setAsWasCode(e.target.value)}
              placeholder="As-Was code를 입력하세요."
            />

            {/* To-Be Code */}
            <textarea
              className="w-[28%] h-[150px] bg-[#D9D9D9] resize-none p-4 border border-gray-300 rounded"
              value={transformedToBeCode}
              onChange={(e) => setToBeCode(e.target.value)}
              placeholder="To-Be code를 입력하세요."
            />

            {/* To-Be 적용 여부 */}
            <div className="flex justify-center w-[18.75%]">
              {isApplied === 'yes' ? (
                <img className="w-[50px] h-[50px]" src={Yes} alt="yes" />
              ) : (
                <img className="w-[50px] h-[50px]" src={No} alt="no" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BasicTextarea;
