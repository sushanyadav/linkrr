import PropTypes from "prop-types";
import { useField } from "formik";

const CheckboxInput = ({
  label,
  labelAdditionalClassName,
  noLabel,
  ...props
}) => {
  const [field, meta] = useField(props);

  return (
    <>
      {noLabel ? (
        <input {...field} {...props} />
      ) : (
        <label
          className={labelAdditionalClassName}
          htmlFor={props.id || props.name}
        >
          <span className="mr-1">{label}</span>
          <input {...field} {...props} />
        </label>
      )}

      {meta.touched && meta.error ? (
        <p className="error">{meta.error}</p>
      ) : null}
    </>
  );
};

CheckboxInput.defaultProps = {
  type: "text",
  placeholder: "",
  noLabel: false,
  label: "",
  labelAdditionalClassName: "",
};

CheckboxInput.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  labelAdditionalClassName: PropTypes.string,
  label: PropTypes.string,
  noLabel: PropTypes.bool,
};

export default CheckboxInput;
