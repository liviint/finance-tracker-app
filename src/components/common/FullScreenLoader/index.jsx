'use client'

import React from "react";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-12 h-12 border-4 border-t-[#FF6B6B] border-gray-200 rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default Loader;
