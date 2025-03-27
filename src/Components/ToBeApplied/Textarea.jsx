import Yes from '@/assets/tobe_yes.png';
import No from '@/assets/tobe_no.png';
import Copy from '@/assets/copy.png';
import { useState } from 'react';

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, isApplied, checked, onCheckedChange, filter, country_code, matchedPart, asWasOccurrenceCount, toBeOccurrenceCount }) => {
  const isCheckboxDisabled = filter === "checked" || filter === "unchecked";

  const transformedAsWasCode = asWasCode?.replace(/\/site\//g, `/${country_code}/`);
  const transformedToBeCode = toBeCode?.replace(/\/site\//g, `/${country_code}/`);
  
  const [isMatchedPartVisible, setIsMatchedPartVisible] = useState(false);

  const handleToggleMatchedPart = () => {
    setIsMatchedPartVisible((prev) => !prev);
  };

  const handleCopyClipBoard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      alert("failed");
    }
  };

  return (
    <div>
      {/* {isEmpty ? (
        <NoValuePage />
      ) : ( */}
        <>    
          <div className="flex justify-between p-4 bg-[#f6f6f6] border-b border-gray-300">
            {/* Checkbox */}
            <div className="flex justify-center items-center w-[12.5%] pr-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={onCheckedChange}
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={isCheckboxDisabled}
              />
            </div>

            {/* PPT No. */}
            <h2 className='flex justify-center items-center w-[12.5%] text-black text-[14px] pr-4'>
              <span className='font-bold'>p. {pptNo}</span>
            </h2>

            {/* As-Was Code */}
            <div className='w-[28%] flex justify-start flex-col'>
              <div>
                <textarea
                className="w-full h-[150px] bg-[#D9D9D9] resize-none p-4 border border-gray-300 rounded"
                value={transformedAsWasCode}
                onChange={(e) => setAsWasCode(e.target.value)}
                placeholder="As-Was code를 입력하세요."
              />
              
                {asWasOccurrenceCount && asWasOccurrenceCount > 0 ? (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>[AS-WAS] 일치하는 코드 출현 횟수:</strong> {asWasOccurrenceCount}회
                  </div>
                 ) : (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>[AS-WAS] 일치하는 코드 출현 횟수:</strong> 없음
                  </div>
                )}
              </div>
              
              {matchedPart && (
                <div className="mt-2">
                  <button
                    onClick={handleToggleMatchedPart}
                    className="bg-gray-100 py-2 px-4 cursor-pointer border border-gray-300 rounded-md text-sm">
                    {isMatchedPartVisible ? '코드 숨기기' : '일치하는 코드 보기'}
                  </button>
                  
                  {isMatchedPartVisible && (
                    <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <strong>Front Matched Part:</strong>
                      <pre className="whitespace-pre-wrap break-words overflow-auto max-w-full py-5">
                        {matchedPart[0]}
                      </pre>
                      <div className='flex justify-end'>
                        <button onClick={() => handleCopyClipBoard(matchedPart[0])}>
                          <img className="w-[18px] h-[18px]" src={Copy} alt="copy" />
                        </button>
                      </div> 
                      <strong>Back Matched Part:</strong>
                      <pre className="whitespace-pre-wrap break-words overflow-auto max-w-full py-5">
                        {matchedPart[1]}
                      </pre>
                      <div className='flex justify-end'>
                        <button onClick={() => handleCopyClipBoard(matchedPart[1])}>
                          <img className="w-[18px] h-[18px]" src={Copy} alt="copy" />
                        </button>
                      </div>                    
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* To-Be Code */}
            <textarea
              className="w-[28%] h-[150px] bg-[#D9D9D9] resize-none p-4 border border-gray-300 rounded flex justify-start"
              value={transformedToBeCode}
              onChange={(e) => setToBeCode(e.target.value)}
              placeholder="To-Be code를 입력하세요."
            />
            <div>
              {/* {toBeOccurrenceCount && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>[TO-BE] 일치하는 코드 출현 횟수:</strong> {toBeOccurrenceCount}회
                </div>
              )} */}
            </div>

            {/* To-Be 적용 여부 */}
            <div className="flex justify-center items-center w-[18.75%]">
              {isApplied === 'yes' ? (
                <img className="w-[50px] h-[50px]" src={Yes} alt="yes" />
              ) : (
                <img className="w-[50px] h-[50px]" src={No} alt="no" />
              )}
            </div>
          </div>          
        </>
      {/* )} */}
    </div>
  );
};

export default BasicTextarea;
