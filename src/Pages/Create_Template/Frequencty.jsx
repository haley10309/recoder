// Frequency.jsx
import React, { useState } from 'react';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import frequency_explaination from '@public/duplicate-finder.png'

const Frequency = () => {
  const [visible, setVisible] = useState(false);

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  return (
    <div className='frequency_modal'>
      <div className='frequency_words' onClick={openModal}><HelpOutlineIcon  color="disabled" />Frequency : </div>
      

      <Rodal width={400} height={350}  visible={visible} onClose={closeModal}  >
        <div className='frequency_modal_content'>Frequncy는 해당 코드가<br/> 'run test'를 통해 업로드 한 파일 내에 <br/>몇 번이나 존재하는 지를 나타냅니다.</div>
        <div className='frequency_modal_img_div'>
            <img className='frequency_modal_img' src={frequency_explaination}/>
        </div>
        
        
      </Rodal>
    </div>
  );
};

export default Frequency;
