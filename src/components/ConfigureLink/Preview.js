import PropTypes from "prop-types";

import Link from "components/Link";

const LinkPreview = ({ data, errors }) => {
  return (
    <div className="preview-section">
      <Link data={data} errors={errors} />
    </div>
  );
};

LinkPreview.defaultProps = {
  errors: {},
};

LinkPreview.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
};

export default LinkPreview;
