import PropTypes from "prop-types";

const Button = ({ type, text, icon, className, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${className} btn`}
    >
      {text}
      {icon && <span>{icon}</span>}
    </button>
  );
};

Button.defaultProps = {
  icon: undefined,
  disabled: false,
  className: "",
  onClick: undefined,
  type: "button",
};

Button.propTypes = {
  icon: PropTypes.object,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
