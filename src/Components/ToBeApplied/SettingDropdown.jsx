import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Dropdown } from "primereact/dropdown";
import { templateOption } from "@/apis/apis";

const divWrapperClasses = {
  dropdown: "ring-[#747D7E] flex h-[35px] gap-2 text-[12px] mr-10 flex-col"
};

const divClasses = {
  default:"focus-within:bg-none h-full p-4 ring-1 ring-black flex justify-center align-center items-center font-[500]"
};

const SettingDropdown = ({
  _wrapperProps,
  _divProps,
  _state,
  _title,
  _value,
  _setValue,
  _url,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOptions = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await templateOption(_url);
        setOptions(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [_url]);


  return (
    <div
      {..._wrapperProps}
      className={twMerge(
        divWrapperClasses.dropdown,
        _state ? divWrapperClasses[_state] : "",
        _wrapperProps?.className,
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
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <div
          {..._divProps}
          className={twMerge(
            divClasses.default,
            _divProps?.className
          )}
        >
          <Dropdown
            value={options.find((option) => option.name === _value)}
            options={options}
            onChange={(e) => _setValue(e.value.name)}
            optionLabel="name"
            placeholder="선택"
            className="lg:px-14 sm:px-10 gap-4"
            filter
            itemTemplate={handleOptions}
          />
        </div>
      )}
    </div>
  );
};

export default SettingDropdown;
