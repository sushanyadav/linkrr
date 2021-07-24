import PropTypes from "prop-types";

import Form from "./Form";
import Preview from "./Preview";

const ConfigureLink = ({ heading, link }) => {
  const getFormValues = (values) => {
    // console.log(values, "values");
  };

  return (
    <div className="link-section-wrapper">
      <div className="form-section">
        <Form heading={heading} link={link} getFormValues={getFormValues} />
      </div>
      <Preview />
    </div>
  );
};

ConfigureLink.defaultProps = {};

ConfigureLink.propTypes = {
  heading: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default ConfigureLink;
