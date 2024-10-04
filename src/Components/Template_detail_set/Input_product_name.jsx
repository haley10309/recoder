import { useState, useEffect } from "react";
import "./Input_product_name.scss";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";

const Input_product_name = ({ productName, setProductName }) => {
  const [productOptions, setProductOptions] = useState([]); // State to hold product options
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch product names from the server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products"); // Adjust the endpoint as needed
        setProductOptions(response.data); // Assuming response.data is an array of product names
      } catch (error) {
        console.error("Error fetching product names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <div className="product_segmented_button">
      <div className="segment-start">
        <div className="container">
          <div className="state-layer">
            <CheckIcon className="check-icon" />
            <div className="label-text">제품 명</div>
          </div>
        </div>
      </div>
      <div className="segment-end">
        <div className="container2">
          {loading ? (
            <p>Loading...</p> // Show loading text while fetching
          ) : (
            <Dropdown
              value={productOptions.find(
                (option) => option.name === productName
              )} // Find the selected product
              options={productOptions}
              onChange={(e) => setProductName(e.value.name)} // Set the product name directly
              optionLabel="name" // The label to display in the dropdown
              placeholder="선택"
              className="dropdown"
              filter
              itemTemplate={productOptionTemplate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Input_product_name;
