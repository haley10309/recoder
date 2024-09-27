import "./Input_product_name.scss";
import CheckIcon from "@mui/icons-material/Check";

const Input_product_name = ({ productName, setProductName }) => {
  return (
    <>
      <div className="product_segmented_button">
        <div className="segment-start">
          <div className="container">
            <div className="state-layer">
              <CheckIcon />
              <div className="label-text">Product Name</div>
            </div>
          </div>
        </div>
        <div className="segment-end">
          <div className="container2">
            <textarea
              className="template_input"
              placeholder="ex) s24"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
              }}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default Input_product_name;
