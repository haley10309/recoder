import "./Input_date.scss";
import CheckIcon from "@mui/icons-material/Check";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const Input_date = ({ createDate, setCreateDate }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="date_segmented_button">
        <div className="date_segment_start">
          <div className="container">
            <div className="state-layer">
              <CheckIcon />
              <div className="label-text">날짜</div>
            </div>
          </div>
        </div>
        <div className="segment-end">
          <div className="container2">
            <DatePicker
              label="날짜 선택"
              value={createDate} // Ensure value is a valid dayjs object
              onChange={(newValue) => {
                // Make sure to handle null case
                if (newValue) {
                  setCreateDate(newValue); // Set as dayjs object
                } else {
                  setCreateDate(dayjs()); // Reset to current date if null
                }
              }}
              renderInput={(params) => (
                <input {...params} className="date-input" />
              )}
            />
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default Input_date;
