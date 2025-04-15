import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const inputWrapperClasses = {
  tobe: "ring-[#747D7E] ring-0 flex h-[35px] gap-2 text-[12px] mr-10 flex-col",
};
const inputClasses = {
  default:"focus-within:bg-none h-full p-4 ring-1 ring-black flex justify-center align-center items-center font-[500]"
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
        "flex items-start justify-center my-6"
      )}
    >
     <div className="flex gap-2 justify-center items-start">
        {_title && (
          <div className="flex items-start font-[600] gap-2">
            {_title}
          </div>
        )}
      </div>
      
      <div
        {..._inputProps}
        className={twMerge(
          inputClasses.default,
          _inputProps?.className
        )}
      >
        <input
          {..._inputProps}
          value={_value}
          onChange={handleChange}
          className={twMerge(
            inputClasses.default,
            _inputProps?.className,
            'ring-0 focus:outline-none'
          )}
        />
    </div>

    </div>
  );
};

export default BasicInput;
