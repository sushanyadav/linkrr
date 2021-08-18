import PropTypes from "prop-types";

const Button = ({
  type,
  text,
  icon,
  iconLeft,
  className,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${className} btn`}
    >
      {icon && iconLeft && (
        <span style={{ marginRight: "0.5rem" }}>{icon}</span>
      )}
      {text}
      {icon && !iconLeft && (
        <span style={{ marginLeft: "0.5rem" }}>{icon}</span>
      )}
    </button>
  );
};

Button.defaultProps = {
  icon: undefined,
  disabled: false,
  iconLeft: false,
  className: "",
  onClick: undefined,
  type: "button",
};

Button.propTypes = {
  icon: PropTypes.object,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  iconLeft: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
