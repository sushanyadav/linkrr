import PropTypes from "prop-types";

import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children, wrapperClassName }) => {
  if (children.type.name === "LinkPage") {
    return children;
  }

  return (
    <div className={wrapperClassName}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

Layout.defaultProps = {
  wrapperClassName: "",
};

Layout.propTypes = {
  wrapperClassName: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.array.isRequired,
  ]),
};

export default Layout;
