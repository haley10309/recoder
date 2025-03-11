import { useState } from "react";
import BasicTextarea from "../../Components/ToBeApplied/Textarea";
import NoValuePage from "./NoValuePage";
import SearchTemplate from "./SearchTemplate";
import FileConvert from "./FileConvert";
import { useRecoilState } from "recoil";
import { textareasState } from "../../recoil/atoms/state";
import { Dropdown } from "../../Components/ToBeApplied/DropDown";

const ToBeApplied = () => {
  const [textareas, setTextareas] = useRecoilState(textareasState);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");
  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  const handleAsWasCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, asWasCode: value } : textarea
    );
    setTextareas(newTextareas);
  };
  
  const handleToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, toBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };
  

  const handleFilterChange = (value) => {
    if(value === '선택된 항목'){
      setFilter('checked');
    } else if (value === '선택되지 않은 항목'){
      setFilter('unchecked');
    } else if (value === '전체 항목') {
      setFilter("all")
    } else {
      setFilter("")
    }
  };

  const handleFilterTobeChange = (value) => {
    console.log(value)
    if(value === 'To-Be 적용'){
      setFilterTobe('yes');
    } else if (value === 'To-Be 미적용'){
      setFilterTobe('no');
    } else if (value === '전체 항목') {
      setFilterTobe("all")
    } else {
      setFilter("")
    }
  }
  
  const handleCheckedChange = (index) => {
    const newTextareas = [...textareas];
    newTextareas[index] = {
      ...newTextareas[index],
      checked: !newTextareas[index].checked,
    };
    setTextareas(newTextareas);
  };
  
  const filteredTextareas = () => {
    let filtered = textareas;

    if (filter === "checked") {
      filtered = filtered.filter((textarea) => textarea.checked);
    } else if (filter === "unchecked") {
      filtered = filtered.filter((textarea) => !textarea.checked);
    }

    if (filterTobe === "yes") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "yes");
    } else if (filterTobe === "no") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "no");
    } 
  
    return filtered;
  };
  

  return (
    <>
      <div className="bg-[#f7f7f7] px-40 py-20">
        <SearchTemplate setTextareas={setTextareas} setCodePairs={setCodePairs} />
        <FileConvert textareas={textareas} setTextareas={setTextareas} />

        <div className="flex flex-col rounded-[10px] bg-white border border-gray-300 text-[#32383E] p-8">
          <div className="flex justify-between">
            <h2 className="font-bold text-black mb-5 text-[16px]">AS-WAS / TO-BE 코드 확인하기</h2>
            <div className="flex justify-end gap-4 pb-4">
                <Dropdown
                  options={["전체 항목", "선택된 항목", "선택되지 않은 항목"]}
                  value={
                    filter === "all" ? "전체 항목" :
                    filter === "checked" ? "선택된 항목" :
                    filter === "unchecked" ? "선택되지 않은 항목" :
                    "전체 항목"
                  }
                  onChange={handleFilterChange}
                />
                <Dropdown
                  options={["전체 항목", "To-Be 적용", "To-Be 미적용"]}
                  value={
                    filterTobe === "all" ? "전체 항목" :
                    filterTobe === "yes" ? "To-Be 적용" :
                    filterTobe === "no" ? "To-Be 미적용" :
                    "To-Be 적용 여부 확인"
                  }
                  onChange={handleFilterTobeChange}
                />
            </div>
        </div>
        <div className="bg-[#f6f6f6] mb-20 w-full">
          <div className="flex justify-between p-4 text-[#32383E] bg-white border border-gray-300">
            <h1 className="w-[12.5%] flex items-center justify-center text-[13px] font-[500]">항목</h1>
            <h1 className="w-[12.5%] flex items-center justify-center text-[13px] font-[500]">PPT NO.</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[13px] font-[500]">As-Was Code</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[13px] font-[500]">To-Be Code</h1>
            <h1 className="w-[18.75%] flex items-center justify-center text-[13px] font-[500]">To-Be 적용 여부</h1>
          </div>

          {filteredTextareas() && (
            filteredTextareas().map((textarea, index) => {
              const matchedPptNo = codePairs.find(pair => pair.aswas_code === textarea.asWasCode)?.ppt_no;

              return (
                <div key={index}>
                  <BasicTextarea
                    pptNo={matchedPptNo}
                    asWasCode={textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`)}
                    setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
                    toBeCode={textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`)}
                    setToBeCode={(value) => handleToBeCodeChange(index, value)}
                    changed={{
                      index: index,
                      changed: textarea.changed,
                    }}
                    isApplied={textarea.isApplied} 
                    onCheckedChange={() => handleCheckedChange(index)}
                    checked={textarea.checked} // checkbox 선택 여부
                    filter={filter}
                    country_code={country_code}
                    matchedPart={textarea.matchedPart} 
                    asWasOccurrenceCount={textarea.asWasOccurrenceCount}
                    toBeOccurrenceCount={textarea.toBeOccurrenceCount}
                  />
                </div>
              );
          })
          // ) : (
          //   <div className="flex justify-center">
          //     <NoValuePage />
          //   </div>
          )}
            </div>
        </div>
        
      </div>
    </>
  );
};

export default ToBeApplied;