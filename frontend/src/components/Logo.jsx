import React from "react";
import logo from "../assets/logo.png";

const Logo = ({
  className = "w-14 h-14 md:w-24 md:h-24 lg:w-32 lg:h-32"
}) => {
  return (
    <div className={`${className} rounded-full flex items-center justify-center`}>
      <img
        src={logo}
        alt="Interview System Logo"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};

export default Logo;
