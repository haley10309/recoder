import { useState } from "react";
import BasicTextarea from "../../Components/ToBeApplied/Textarea";
import NoValuePage from "./NoValuePage";
import SearchTemplate from "./SearchTemplate";
import FileConvert from "./FileConvert";
import { useRecoilState } from "recoil";
import { textareasState } from "../../recoil/atoms/state";

const ToBeApplied = () => {
  const [textareas, setTextareas] = useRecoilState(textareasState);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterTobe, setFilterTobe] = useState("all");

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
  

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const hangdleFilterTobeChange = (e) => {
    setFilterTobe(e.target.value);
  }

  
  const handleCheckedChange = (index) => {
    const newTextareas = [...textareas];
    newTextareas[index].checked = !newTextareas[index].checked;
    setTextareas(newTextareas);
  };
  
  const filteredTextareas = () => {
    let filtered = textareas;

    // 필터링된 항목을 먼저 처리
    if (filter === "checked") {
      filtered = filtered.filter((textarea) => textarea.checked);
    } else if (filter === "unchecked") {
      filtered = filtered.filter((textarea) => !textarea.checked);
    }

    // To-Be 적용 여부 필터링 처리
    if (filterTobe === "yes") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "yes");
    } else if (filterTobe === "no") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "no");
    }

    return filtered;
  };
  

  return (
    <>
      <div className="bg-white mx-60">
        <h1 className="font-bold text-black my-10 text-[30px]">HOTFIX TO-BE 적용 페이지</h1>        
        
        <SearchTemplate setTextareas={setTextareas} setCodePairs={setCodePairs} />
        <FileConvert textareas={textareas} setTextareas={setTextareas} />
        <div className="flex justify-between gap-4">
            <select onChange={handleFilterChange} value={filter} className="rounded text-black h-10 text-center">
              <option value="all">전체 항목</option>
              <option value="checked">체크된 항목</option>
              <option value="unchecked">체크되지 않은 항목</option>
            </select>
            <select onChange={hangdleFilterTobeChange} value={filterTobe} className="rounded text-black h-10 text-center">
              <option value="all">To-Be 적용 여부 확인</option>
              <option value="yes">To-Be 적용</option>
              <option value="no">To-Be 미적용</option>
            </select>
        </div>
        
        <div className="bg-[#f6f6f6] mb-20">
          <div className="flex justify-between p-4 bg-[#495057] text-white border-b border-gray-300">
            <h1 className="w-[12.5%] flex items-center justify-center text-[14px] font-[500]">항목</h1>
            <h1 className="w-[12.5%] flex items-center justify-center text-[14px] font-[500]">PPT NO.</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[14px] font-[500]">As-Was Code</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[14px] font-[500]">To-Be Code</h1>
            <h1 className="w-[18.75%] flex items-center justify-center text-[14px] font-[500]">To-Be 적용 여부</h1>
          </div>

          {filteredTextareas().length > 0 ? (
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
                  />
                </div>
        );
      })
          ) : (
            <div className="flex justify-center">
              <NoValuePage />
            </div>
          )}
            </div>
          </div>
    </>
  );
};

export default ToBeApplied;