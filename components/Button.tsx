import React from "react";

interface ButtonProps {
  // Changed from string to React.ReactNode to allow icons
  btnName: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({ btnName, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${className} mr-4 w-[200px] rounded-full border-none py-3 text-center text-2xl font-semibold text-white`}
    >
      {btnName}
    </button>
  );
};

export default Button;
