import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { AutoComplete } from "primereact/autocomplete";
import { templateOption } from "@/apis/apis";

const divWrapperClasses = {
  dropdown: "flex flex-col gap-1 text-[12px] mr-10",
};

const divClasses = {
  default: "bg-white h-[42px] flex items-center px-4 font-[500] " + "border border-[#FF782F] rounded-[10px]",
};

const InputDrop = ({ _wrapperProps, _divProps, _state, _title, _value, _setValue, _url }) => {
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await templateOption(_url);
        setOptions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [_url]);

  const searchOptions = (e) => {
    const q = e.query?.toLowerCase() || "";
    setFilteredOptions(options.filter((opt) => opt.name && opt.name.toLowerCase().includes(q)));
  };

  return (
    <div {..._wrapperProps} className={twMerge(divWrapperClasses.dropdown, _wrapperProps?.className)}>
      {_title && <div className="font-[600]">{_title}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <AutoComplete
          {..._divProps}
          value={_value}
          suggestions={filteredOptions}
          completeMethod={searchOptions}
          field="name"
          dropdown
          onChange={(e) => _setValue(e.target.value)}
          onSelect={(e) => _setValue(e.value.name)}
          placeholder="입력하거나 선택해 주세요"
          className={twMerge(divClasses.default, _divProps?.className)}
          panelClassName="shadow-lg p-0"
          panelStyle={{
            backgroundColor: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            zIndex: 1000,
            padding: 0,
          }}
          itemTemplate={(opt) => <div className="px-4 py-2 hover:bg-[#FF782F] hover:text-white">{opt.name}</div>}
        />
      )}
    </div>
  );
};

export default InputDrop;
