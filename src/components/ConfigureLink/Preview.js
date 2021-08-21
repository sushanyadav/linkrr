import PropTypes from "prop-types";
import { useRouter } from "next/router";

import Link from "components/Link";
import Button from "components/Button";

const LinkPreview = ({ data, errors }) => {
  const { pathname } = useRouter();

  return (
    <div className="preview-section">
      <h1 className="preview-section__heading">
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="#1F2937"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M12 5.249c-7.5 0-10.5 6.75-10.5 6.75s3 6.75 10.5 6.75 10.5-6.75 10.5-6.75-3-6.75-10.5-6.75z"
            ></path>
            <path
              stroke="#1F2937"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            ></path>
          </svg>
        </span>
        Preview
      </h1>
      <Link data={data} wrapperClassName="rounded" errors={errors} />
      {pathname === "/edit" && (
        <a href={`/${data.link}`} target="_blank" rel="noreferrer">
          <Button text="Visit your OneLink" className="mt-2 btn--secondary" />
        </a>
      )}
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
