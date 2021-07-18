import PropTypes from "prop-types";

import "assets/scss/main.scss";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

MyApp.defaultProps = {};

MyApp.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
