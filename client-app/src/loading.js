import React from "react";
import { CircleLoader } from "react-spinners";

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <CircleLoader color="#00BFFF" height={80} width={80} ariaLabel="loading" />
        </div>
    );
};

export default LoadingSpinner;
