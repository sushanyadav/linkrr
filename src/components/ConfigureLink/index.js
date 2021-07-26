import PropTypes from "prop-types";

import Form from "./Form";
import Preview from "./Preview";

const ConfigureLink = ({ heading, initialFormValues }) => {
  const getFormValues = (values) => {
    // console.log(values, "values");
  };

  return (
    <div className="link-section-wrapper">
      <div className="form-section">
        <Form
          heading={heading}
          initialFormValues={initialFormValues}
          getFormValues={getFormValues}
        />
      </div>
      <Preview />
    </div>
  );
};

ConfigureLink.defaultProps = {};

ConfigureLink.propTypes = {
  heading: PropTypes.string.isRequired,
  initialFormValues: PropTypes.object.isRequired,
};

export default ConfigureLink;
