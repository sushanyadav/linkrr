import PropTypes from "prop-types";
import { useField } from "formik";

const TextInput = ({ label, noLabel, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <>
      {noLabel ? (
        <input {...field} {...props} />
      ) : (
        <label htmlFor={props.id || props.name}>
          <span>{label}</span>
          <input {...field} {...props} />
        </label>
      )}

      {meta.touched && meta.error ? (
        <p className="error">{meta.error}</p>
      ) : null}
    </>
  );
};

TextInput.defaultProps = {
  type: "text",
  placeholder: "",
  noLabel: false,
  label: "",
};

TextInput.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  noLabel: PropTypes.bool,
};

export default TextInput;
