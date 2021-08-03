import PropTypes from "prop-types";

import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  if (children.type.name === "LinkPage") {
    return children;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

Layout.defaultProps = {};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.array.isRequired,
  ]),
};

export default Layout;
