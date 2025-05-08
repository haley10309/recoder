import React, { useState } from "react";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

const Before_upload = () => {
  return (
    <div className="Before_upload">
      <SentimentDissatisfiedIcon />
      <div class="smiley-face">
        <div class="eyes"></div>
        <div class="mouth"></div>
      </div>
    </div>
  );
};

export default Before_upload;
