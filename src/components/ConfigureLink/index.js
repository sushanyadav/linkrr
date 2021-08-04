import PropTypes from "prop-types";
import { useState } from "react";

import Form from "./Form";
import Preview from "./Preview";

const ConfigureLink = ({ heading, initialFormValues }) => {
  const [data, setData] = useState(initialFormValues);
  const [errors, setErrors] = useState({});

  const getFormValues = (values) => {
    setData(values);
  };
  const getFormErrors = (errors) => {
    setErrors(errors);
  };

  return (
    <div className="link-section-wrapper">
      <div className="form-section">
        <Form
          heading={heading}
          initialFormValues={initialFormValues}
          getFormValues={getFormValues}
          getFormErrors={getFormErrors}
        />
      </div>
      <Preview errors={errors} data={data} />
    </div>
  );
};

ConfigureLink.defaultProps = {};

ConfigureLink.propTypes = {
  heading: PropTypes.string.isRequired,
  initialFormValues: PropTypes.object.isRequired,
};

export default ConfigureLink;
