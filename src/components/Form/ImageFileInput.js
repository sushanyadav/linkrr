import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";

const ImageFileInput = ({
  setFieldValue,
  error,
  setFileTouched,
  fileTouched,
}) => {
  const [previewSource, setPreviewSource] = useState("");
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
          id="file"
          name="file"
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files[0];

            setFieldValue("file", file);
            if (file) {
              previewFile(file);
            }
          }}
          className="form-control"
          accept="image/png, image/gif, image/jpeg"
          style={{ display: "none" }}
        />
        <label
          htmlFor="file"
          onClick={() => setFileTouched(true)}
          style={{ marginLeft: "1rem" }}
        >
          Browse
        </label>
      </div>

      {fileTouched && error && <p className="error">{error}</p>}
      {!error && loading && <p className="feedback">Loading...</p>}
    </>
  );
};

ImageFileInput.defaultProps = {
  error: undefined,
};

ImageFileInput.propTypes = {
  setFieldValue: PropTypes.func.isRequired,
  setFileTouched: PropTypes.func.isRequired,
  error: PropTypes.string,
  fileTouched: PropTypes.bool.isRequired,
};

export default ImageFileInput;
