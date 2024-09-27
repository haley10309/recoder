import "./Input_pdp.scss";
import CheckIcon from "@mui/icons-material/Check";

const Input_pdp = ({ PDP, setPDP }) => {
  return (
    <>
      <div className="pdp_segmented_button">
        <div className="segment-start">
          <div className="container">
            <div className="state-layer">
              <CheckIcon />
              <div className="label-text">PDP</div>
            </div>
          </div>
        </div>
        <div className="segment-end">
          <div className="container2">
            <textarea
              className="text-area"
              placeholder="ex) Features"
              value={PDP}
              onChange={(e) => {
                setPDP(e.target.value);
              }}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default Input_pdp;
