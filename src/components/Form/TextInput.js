import PropTypes from "prop-types";
import { useField } from "formik";
import { useState, useRef, useEffect } from "react";

const TextInput = ({
  label,
  noLabel,
  closeToolTip,
  openToolTip,
  showToolTip,
  ...props
}) => {
  const [field, meta] = useField(props);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && focused) {
      inputRef.current.focus();
    }
  }, [inputRef, focused]);

  useEffect(() => {
    if (field.value !== "") {
      setFocused(true);
    } else {
      setFocused(false);
    }
    // eslint-disable-next-line
  }, [field.value]);

  return (
    <>
      {noLabel ? (
        <input {...field} {...props} />
      ) : (
        <div className={`${focused ? "focused" : ""} form-group`}>
          <input
            ref={inputRef}
            onFocus={() => setFocused(true)}
            className="form-input"
            {...field}
            {...props}
            onBlur={(e) => {
              // call the built-in handleBur
              field.onBlur(e);
              // and do something about e
              if (field.value === "") setFocused(false);
            }}
          />
          <label
            className="form-label"
            onClick={() => setFocused(true)}
            htmlFor={props.id || props.name}
          >
            {label}
          </label>

          {meta.touched && meta.error && (
            <div className="notification-wrapper">
              <div
                onMouseOver={openToolTip}
                onMouseLeave={closeToolTip}
                data-error={meta.error}
                className={`${
                  showToolTip ? "show-tooltip" : ""
                } notification-icon error`}
              >
                !
              </div>
            </div>
          )}
          {meta.touched && !meta.error && field.value !== "" && (
            <div className="notification-wrapper">
              <div className="notification-icon success">✔</div>
            </div>
          )}
        </div>
      )}
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
  showToolTip: PropTypes.bool.isRequired,
  closeToolTip: PropTypes.func.isRequired,
  openToolTip: PropTypes.func.isRequired,
};

export default TextInput;
