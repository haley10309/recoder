import Yes from '../../assets/tobe_yes.png';
import No from '../../assets/tobe_no.png';
import Delete from '../../assets/mi_delete.svg';

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, changed, onDelete }) => {

  const handleDeleteClick = () => {
    if (window.confirm("해당 항목을 삭제하시겠습니까?")) {
      onDelete();
    }
  };

  
  return (
    <div className="flex items-center justify-between px-20 py-10 font-medium">
      <h2 className='flex justify-center w-[12.5%] text-black text-[14px]'>Slide &nbsp;<span className='font-bold'> p.{pptNo}</span></h2>
      <button 
        className="flex justify-center w-[6.25%]"
        onClick={handleDeleteClick}>
          <div className='flex jusfiy-center p-2 rounded-xl'>
             <img fill='#FF4747' className='w-10 h-10' src={Delete} alt="Delete image" />
          </div>
          </button>
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
      <div className='flex justify-center w-[18.75%]'>
        {changed !== null && changed.changed === true ? (
          <img className='w-[50px] h-[50px] align-center' src={Yes} alt="yes" />
        ) : (
          <img className='w-[50px] h-[50px] align-center' src={No} alt="no" />
        )}
      </div>
    </div>
  );
};

export default BasicTextarea;
