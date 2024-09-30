// import Yes from '../../assets/tobe_yes.png';
// import No from '../../assets/tobe_no.png';

// const BasicTextarea = ({ asWasCode, setAsWasCode, toBeCode, setToBeCode, changed }) => {
//   return (
//     <div className="flex items-center justify-between px-20 py-10 font-medium">
//       <h2 className='flex justify-center w-[12.5%]'>{changed.index + 1}</h2>
//       <input className="flex justify-center w-[6.25%]" type="checkbox" />
//       <textarea
//         className="flex justify-center w-[28%] h-[200px] bg-[#D9D9D9] resize-none p-4"
//         value={asWasCode}
//         onChange={(e) => setAsWasCode(e.target.value)}
//         placeholder="As-Was code를 입력하세요."
//       />
//       <textarea
//         value={toBeCode}
//         className="flex justify-center w-[28%] h-[200px] bg-[#D9D9D9] resize-none p-4"
//         onChange={(e) => setToBeCode(e.target.value)}
//         placeholder="To-Be code를 입력하세요."
//       />
//       <div className='flex justify-center w-[18.75%]'>
//         {changed !== null && changed.changed ? (
//           <img className='w-[50px] h-[50px] align-center' src={Yes} alt="yes" />
//         ) : (
//           <img className='w-[50px] h-[50px] align-center' src={No} alt="no" />
//         )}
//       </div>
//     </div>
//   );
// };

// export default BasicTextarea;


import Yes from '../../assets/tobe_yes.png';
import No from '../../assets/tobe_no.png';

const BasicTextarea = ({ pptNo, asWasCode, setAsWasCode, toBeCode, setToBeCode, changed, onDelete }) => {

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      onDelete();  // Call the onDelete function passed as a prop
    }
  };
  
  return (
    <div className="flex items-center justify-between px-20 py-10 font-medium">
      <h2 className='flex justify-center w-[12.5%]'>{pptNo}</h2>
      <input
        className="flex justify-center w-[6.25%]"
        type="checkbox"
        onChange={handleCheckboxChange}
      />
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
