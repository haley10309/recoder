import { useState, useEffect } from "react";
import "./Input_pdp.scss";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";

const Input_pdp = ({ PDP, setPDP }) => {
  const [pdpOptions, setPdpOptions] = useState([]); // State to hold PDP options
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch PDP names from the server
  useEffect(() => {
    const fetchPDPs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pdps"); // Adjust the endpoint as needed
        setPdpOptions(response.data); // Assuming response.data is an array of PDP names
      } catch (error) {
        console.error("Error fetching PDP names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPDPs();
  }, []);

  const pdpOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
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
          {loading ? (
            <p>Loading...</p> // Show loading text while fetching
          ) : (
            <Dropdown
              value={pdpOptions.find((option) => option.name === PDP)} // Find the selected PDP
              options={pdpOptions}
              onChange={(e) => setPDP(e.value.name)} // Set the PDP name directly
              optionLabel="name" // The label to display in the dropdown
              placeholder="선택"
              className="dropdown"
              filter
              itemTemplate={pdpOptionTemplate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Input_pdp;
