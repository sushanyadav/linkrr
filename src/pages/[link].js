import PropTypes from "prop-types";

import { connectToDatabase } from "lib/db";

const LinkPage = ({ data, errorFromServer }) => {
  if (errorFromServer) {
    return (
      <div className="container center-vph-w-header">
        <h1>{errorFromServer}</h1>
      </div>
    );
  }

  return (
    <div className="container center-vph-w-header">
      {data.personalDetails.name}
    </div>
  );
};

LinkPage.defaultProps = {
  data: undefined,
  errorFromServer: undefined,
};

LinkPage.propTypes = {
  data: PropTypes.object,
  errorFromServer: PropTypes.string,
};

export async function getServerSideProps(context) {
  const link = context.query.link;

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    return {
      props: {
        errorFromServer: "Couldn't connect to database!",
      },
    };
  }

  const userCollection = client.db().collection("users");

  let user;

  try {
    user = await userCollection.findOne({
      "data.link": link,
    });
  } catch (err) {
    return {
      props: {
        errorFromServer: "Couldn't find the data.",
      },
    };
  }

  if (user && user.data) {
    return {
      props: {
        data: user.data,
      },
    };
  } else {
    return {
      props: {
        errorFromServer: "Couldn't find the data.",
      },
    };
  }
}

export default LinkPage;
