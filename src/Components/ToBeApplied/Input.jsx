import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Check from '@/assets/check.png'

const inputWrapperClasses = {
  tobe:
    'bg-[#E4F7BA] rounded-[20px] ring-1 ring-[#747D7E] flex h-[35px] gap-2 text-[10px] w-full',
  template: 'bg-[#E8DEF8] ring-[#f3f3f3] focus-within:bg-[#f3f3f3]',
};
const inputClasses = {
  default: 'focus-within:bg-none w-full bg-white focus:outline-none focus:ring-0',
  'default-font':
    'font-noto placeholder:text-[#787878] text-[12px] font-normal leading-normal',
};

const BasicInput = ({
  _wrapperProps,
  _inputProps,
  _state,
  _title,
  _onChange,
  _value,
}) => {
  const [isValidFormat, setIsValidFormat] = useState(true);

  const handleChange = (e) => {
    const value = e.target.value;
    setIsValidFormat(true); 
    if (_onChange) {
      _onChange(value);
    }
  };

  return (
    <div
      {..._wrapperProps}
      className={twMerge(
        inputWrapperClasses.tobe,
        _state ? inputWrapperClasses[_state] : '',
        _wrapperProps?.className,
        isValidFormat ? '' : inputWrapperClasses.default,
        'flex items-center'
      )}
    >
      <div className='flex flex-[0.5] gap-2 justify-center'>
        <img className='w-[14px] h-[12px] align-center' src={Check} alt="check" />
        {_title && <div className="flex items-center font-medium">{_title}</div>}
      </div>
      <input
  {..._inputProps}
  value={_value}
  onChange={handleChange}
  className={twMerge(
    inputClasses.default,
    inputClasses['default-font'],
    'flex-[0.5] h-full p-0 pl-2 rounded-tr-[20px] rounded-br-[20px] font-medium border-l border-[#747D7E] focus:border-l-[#747D7E] focus:outline-none', // 왼쪽 경계 추가
    _inputProps?.className
  )}
/>

    </div>
  );
};

export default BasicInput;
