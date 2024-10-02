import { useState, useEffect } from "react";
import "./Input_Project.scss";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";

const Input_Project = ({ projectName, setProjectName }) => {
  const [projectOptions, setProjectOptions] = useState([]); // State to hold project options
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch project names from the server
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/projects"); // Adjust the endpoint as needed
        setProjectOptions(response.data); // Assuming response.data is an array of project names
      } catch (error) {
        console.error("Error fetching project names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const projectOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <div className="project_segmented_button">
      <div className="segment-start">
        <div className="container">
          <div className="state-layer">
            <CheckIcon className="check-icon" />
            <div className="label-text">프로젝트</div>
          </div>
        </div>
      </div>
      <div className="segment-end">
        <div className="container2">
          {loading ? (
            <p>Loading...</p> // Show loading text while fetching
          ) : (
            <Dropdown
              value={projectOptions.find(
                (option) => option.name === projectName
              )} // Find the selected project
              options={projectOptions}
              onChange={(e) => setProjectName(e.value.name)} // Set the project name directly
              optionLabel="name" // The label to display in the dropdown
              placeholder="선택"
              className="dropdown"
              filter
              itemTemplate={projectOptionTemplate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Input_Project;
