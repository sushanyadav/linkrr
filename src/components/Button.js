import PropTypes from "prop-types";

const Button = ({
  type,
  text,
  icon,
  iconLeft,
  className,
  spanClassName,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${className} btn center`}
    >
      {icon && iconLeft && (
        <span
          className={spanClassName}
          style={{ marginRight: text ? "0.5rem" : 0 }}
        >
          {icon}
        </span>
      )}
      {text}
      {icon && !iconLeft && (
        <span
          className={spanClassName}
          style={{ marginLeft: text ? "0.5rem" : 0 }}
        >
          {icon}
        </span>
      )}
    </button>
  );
};

Button.defaultProps = {
  icon: undefined,
  disabled: false,
  iconLeft: false,
  className: "",
  spanClassName: "",
  onClick: undefined,
  type: "button",
};

Button.propTypes = {
  icon: PropTypes.object,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  iconLeft: PropTypes.bool,
  className: PropTypes.string,
  spanClassName: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
