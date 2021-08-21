import PropTypes from "prop-types";
import { useField } from "formik";

const ColorInput = ({ label, labelAdditionalClassName, noLabel, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <>
      {noLabel ? (
        <input {...field} {...props} />
      ) : (
        <label
          className={`${labelAdditionalClassName} color-picker-wrapper`}
          htmlFor={props.id || props.name}
        >
          <span className="mr-1">{label}</span>
          <input {...field} {...props} />
          <span className="color-preview"></span>
        </label>
      )}

      {meta.touched && meta.error ? (
        <p className="error">{meta.error}</p>
      ) : null}
    </>
  );
};

ColorInput.defaultProps = {
  type: "text",
  placeholder: "",
  noLabel: false,
  label: "",
  labelAdditionalClassName: "",
};

ColorInput.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  labelAdditionalClassName: PropTypes.string,
  label: PropTypes.string,
  noLabel: PropTypes.bool,
};

export default ColorInput;
