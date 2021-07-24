import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";

const FileInput = ({
  setFieldValue,
  setFieldTouched,
  touched,
  name,
  error,
  label,
}) => {
  const [previewSource, setPreviewSource] = useState(null);
  const [loading, setLoading] = useState(false);

  const previewFile = (file) => {
    setLoading(true);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
      setLoading(false);
    };
  };

  return (
    <>
      <div className="ml-1" style={{ alignSelf: "center" }}>
        <label>
          <span>{label}</span>

          <input
            id="file"
            name={name}
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files[0];

              setFieldTouched(name, true);
              setFieldValue(name, file);
              if (file) {
                previewFile(file);
              }
            }}
            className="form-control"
            style={{ display: "none" }}
            accept="image/png, image/gif, image/jpeg"
          />

          {!error && previewSource ? (
            <Image
              src={previewSource}
              width="30px"
              height="30px"
              className="preview-image"
              layout="fixed"
              alt=""
            />
          ) : (
            <div
              className="preview-placeholder"
              style={{ width: "30px", height: "30px" }}
            ></div>
          )}
        </label>
      </div>
      {touched && error && <p className="error">{error}</p>}
      {loading && <p className="feedback">Loading...</p>}
    </>
  );
};

FileInput.defaultProps = {
  label: undefined,
  error: undefined,
  touched: undefined,
};

FileInput.propTypes = {
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  touched: PropTypes.bool,
  label: PropTypes.string,
};

export default FileInput;
