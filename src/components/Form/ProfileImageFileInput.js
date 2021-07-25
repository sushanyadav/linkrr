import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";

const ImageFileInput = ({
  setFieldValue,
  setFieldTouched,
  error,
  name,
  touched,
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
      <div className="flex flex-ai-c">
        {!error && previewSource ? (
          <Image
            src={previewSource}
            alt="chosen"
            className="preview-image"
            width={60}
            height={60}
          />
        ) : (
          <div className="preview-placeholder"></div>
        )}

        <input
          id={name}
          name={name}
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files[0];

            if (file) {
              const reader = new FileReader();

              reader.readAsDataURL(file);
              reader.onloadend = () => {
                setFieldTouched(name, true);

                setFieldValue(name, reader.result);
              };
              previewFile(file);
            }
          }}
          className="form-control"
          accept="image/png, image/gif, image/jpeg"
          style={{ display: "none" }}
        />
        <label htmlFor={name} style={{ marginLeft: "1rem" }}>
          Browse
        </label>
      </div>

      {touched && error && <p className="error">{error}</p>}
      {!error && loading && <p className="feedback">Loading...</p>}
    </>
  );
};

ImageFileInput.defaultProps = {
  error: undefined,
  touched: undefined,
};

ImageFileInput.propTypes = {
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  touched: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};

export default ImageFileInput;
