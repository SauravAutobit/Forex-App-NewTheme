import { Link } from "react-router-dom";
import "./Button.css";

interface ButtonProps {
  label: string;
  btnRoute?: string;
  width?: string;
  height?: string;
  bgColor?: string;
  textColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  borderRadius?: string;
  border?: string;
  fontWeight?: number;
  fontSize?: string;
}

const Button = ({
  label,
  btnRoute,
  width = "144px",
  height = "53px",
  bgColor = "var(--quaternary-color)",
  textColor = "var(--tertiary-color)",
  onClick,
  disabled = false,
  borderRadius = "10px",
  border = "none",
  fontWeight = 400,
  fontSize = "14px",
}: ButtonProps) => {
  const buttonStyles = {
    width,
    height,
    background: bgColor,
    color: textColor,
    borderRadius: borderRadius,
    border,
    fontWeight,
    fontSize,
  };

  if (btnRoute) {
    return (
      <Link to={btnRoute}>
        <button className="btn-global" style={buttonStyles}>
          {label}
        </button>
      </Link>
    );
  }

  return (
    <button
      className="btn-global"
      style={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
