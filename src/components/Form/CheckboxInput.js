import PropTypes from "prop-types";
import { useField } from "formik";

const CheckboxInput = ({ label, noLabel, toggler, customStyle, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <>
      {noLabel ? (
        <div className={`${toggler ? "switch" : "checkbox"}`}>
          <input
            id={props.id || props.name}
            style={customStyle}
            className="no-margin"
            {...field}
            {...props}
          />
          <label
            className="label-horizontal checkbox__label"
            htmlFor={props.id || props.name}
          ></label>
        </div>
      ) : (
        <div className={`${toggler ? "switch" : "checkbox"}`}>
          <input {...field} {...props} id={props.id || props.name} />
          <label
            className="label-horizontal checkbox__label"
            htmlFor={props.id || props.name}
          >
            {label}
          </label>
        </div>
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
  toggler: false,
  label: "",
  customStyle: {},
};

CheckboxInput.propTypes = {
  type: PropTypes.string,
  customStyle: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  noLabel: PropTypes.bool,
  toggler: PropTypes.bool,
};

export default CheckboxInput;
