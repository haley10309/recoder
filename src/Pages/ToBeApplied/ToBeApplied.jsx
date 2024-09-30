import { useState } from "react";
import axios from 'axios';
import BasicInput from "../../Components/ToBeApplied/Input";
import Process from '../../assets/uim_process.png';
import BasicTextarea from "../../Components/ToBeApplied/Textarea";
import Country_code from "../../Components/Template_detail_set/Country_code";

const ToBeApplied = () => {
  const [projectName, setProjectName] = useState('');
  const [pdp, setPdp] = useState('');
  const [productName, setProductName] = useState('');
  const [originalFile, setOriginalFile] = useState(null);
  const [textareas, setTextareas] = useState([{ asWasCode: '', toBeCode: '' }]); 
  const [downloadLink, setDownloadLink] = useState('');
  const [changeResults, setChangeResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");

  const handleProjectNameChange = (projectName) => {
    setProjectName(projectName);
  };

  const handlePdpChange = (pdp) => {
    setPdp(pdp);
  };

  const handleProductNameChange = (productName) => {
    setProductName(productName);
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOriginalFile(selectedFile);
      console.log("Selected file:", selectedFile);
    } else {
      console.warn("No file selected");
    }
  };

  const handleAsWasCodeChange = (index, value) => {
    const newTextareas = [...textareas];
    newTextareas[index].asWasCode = value;
    setTextareas(newTextareas);
  };

  const handleToBeCodeChange = (index, value) => {
    const newTextareas = [...textareas];
    newTextareas[index].toBeCode = value;
    setTextareas(newTextareas);
  };

  const handleDeleteTextarea = (index) => {
    const newTextareas = textareas.filter((_, i) => i !== index);
    setTextareas(newTextareas);
  };

  const handleChangeResults = (changeResults) => {
    changeResults.forEach(({ pairIndex, changed }) => {
      if (changed) {
        console.log(`Pair ${pairIndex} has been changed: ${changed}`);
      } else {
        console.log(`Pair ${pairIndex} was not changed: ${changed}`);
      }
    });
  };

  const handleSetting = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search-setting', {
        hotfix_name: projectName,
        pdp_name: pdp,
        product: productName
      });
      
      if (response.data.success) {
        const pairs = response.data.codePairs;

        const newTextareas = pairs.map(pair => ({
          asWasCode: pair.aswas_code,
          toBeCode: pair.tobe_code
        }));

        setTextareas(newTextareas);
        setCodePairs(pairs);
        console.log('Code pairs:', pairs);
      } else {
        alert('해당 값이 존재하지 않습니다.');
      }

    } catch (error) {
      console.error('Error fetching code pairs:', error);
    }
  };
  
  const handleExecute = async () => {
    // 모든 textareas의 asWasCode와 toBeCode가 비어있지 않은지 확인
    if (originalFile && textareas.every(({ asWasCode, toBeCode }) => asWasCode && toBeCode)) {
      const formData = new FormData();
      formData.append('file', originalFile);
  
      const codePairs = textareas.map(textarea => ({
        asWasCode: textarea.asWasCode,
        toBeCode: textarea.toBeCode
      }));
      
      formData.append('codePairs', JSON.stringify(codePairs));
  
      try {
        setIsProcessing(true);
        const response = await axios.post(`http://localhost:5000/api/process-file`, formData);
        
        const { downloadLink, changeResults } = response.data;
        setChangeResults(changeResults);
        handleChangeResults(changeResults);
  
        if (downloadLink) {
          setDownloadLink(response.data.downloadLink);
        }
  
      } catch (error) {
        console.error('Error processing file', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일을 선택하고 모든 텍스트 영역에 asWasCode와 toBeCode를 입력하세요.");
    }
  };
  

  const handleDownload = async () => {
    if (!downloadLink) {
      console.warn("Download link is not set");
      return;
    }

    try {
      const downloadResponse = await axios.get(downloadLink, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'changed_to-be.html');
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Error downloading file', error);
    }
  };

  return (
    <>
      <div className="bg-white">
        <div className="flex w-full p-14 justify-between gap-10 bg-[#f6f6f6] shadow-xl">
          <div className="flex gap-10">
            <BasicInput
              _inputProps={{ placeholder: 'S24' }}
              _title={'프로젝트명'}
              _onChange={handleProjectNameChange}
              _value={projectName}
            />
            <BasicInput
              _inputProps={{ placeholder: 'Features' }}
              _title={'PDP'}
              _onChange={handlePdpChange}
              _value={pdp}
            />
            <BasicInput
              _inputProps={{ placeholder: 'B5' }}
              _title={'Product Name'}
              _onChange={handleProductNameChange}
              _value={productName}
            />            
            <Country_code
              country_code={country_code}
              setCountry_code={setCountry_code}
            />
          </div>
          <button className="bg-black text-white font-semibold text-[14px] rounded-[20px] w-[150px]"
          onClick={handleSetting}>
            세팅 가져오기
          </button>
        </div>

        <div className="flex justify-center items-center gap-20 p-14">
          <div className="border-dashed border-black border-2 p-6 w-[300px]">
            <h1 className="font-bold pb-4">Original Code File</h1>
            <input 
              className='file-input'
              type="file"
              onChange={handleFileChange}
            />
          </div>
          <button className="flex items-center justify-center gap-2 font-bold bg-[#00A3FF] h-[41px] w-[137px] text-white" onClick={handleExecute} disabled={isProcessing}>
            {isProcessing ? '실행 중 ..' : '실행'}
            <img className='w-[19px] align-center' src={Process} alt="process" />
          </button>
          <div className="border-dashed border-black border-2 p-6 w-[300px]">
            <h1 className="font-bold pb-4">Changed Code File</h1>
            {downloadLink ? (
              <button onClick={handleDownload} className="flex justify-center items-center align-center bg-black w-[130px] h-[27px] text-center text-white rounded">
                파일 다운로드
              </button>
              )
              : 
              (
               <div className="flex justify-center items-center align-center bg-[#c9c99] w-[130px] h-[27px] text-center text-white rounded">
                파일 다운로드
              </div>
              )
            }
          </div>
        </div>

        <div className="bg-[#f6f6f6]">
          <div className="flex justify-between p-20 font-bold">
            <h1 className="w-[12.5%] flex items-center justify-center">PPT NO.</h1>   
            <h1 className="w-[6.25%] flex items-center justify-center">항목 삭제</h1>  
            <h1 className="w-[28%] flex items-center justify-center">As-Was Code</h1> 
            <h1 className="w-[28%] flex items-center justify-center">To-Be Code</h1> 
            <h1 className="w-[18.75%] flex items-center justify-center">To-Be 적용 여부</h1>
          </div>

          {textareas.length > 0 ? (
            textareas.map((textarea, index) => (
              <BasicTextarea
                key={index}
                pptNo={codePairs[index]?.ppt_no}
                asWasCode={textarea.asWasCode} 
                setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
                toBeCode={textarea.toBeCode} 
                setToBeCode={(value) => handleToBeCodeChange(index, value)}
                changed={{
                  index: index,
                  changed: changeResults[index] ? changeResults[index].changed : null
                }} 
                onDelete={() => handleDeleteTextarea(index)} 
              />
            ))
          ) : (
            <p>코드 쌍이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ToBeApplied;
