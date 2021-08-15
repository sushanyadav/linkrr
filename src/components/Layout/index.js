import PropTypes from "prop-types";

import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  if (children.type.name === "LinkPage") {
    return children;
  }

  return (
    <div className="bg-gradient">
      <Header />
      {children}
      <Footer />
    </div>
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
