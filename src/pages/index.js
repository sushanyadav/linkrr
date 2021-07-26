import { useState } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";

import { connectToDatabase } from "lib/db";

export default function HomePage({ session, errorFromServer, hasLink, data }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  if (errorFromServer) {
    return (
      <div className="container center-vph-w-header">
        <h1>{errorFromServer}</h1>
      </div>
    );
  }

  const submitHandler = (e) => {
    e.preventDefault();
    if (!link || link.trim() === "") {
      setError("Required");

      return;
    }

    router.push({
      pathname: "/create",
      query: { link: link.trim() },
    });
  };

  const goToEditPage = () => {
    router.push({
      pathname: "/edit",
    });
  };

  return (
    <main className="container center-vph-w-header flex flex-col">
      <h1 className="main-text">
        Logged in from <strong>{session.user.email}</strong>
      </h1>
      {hasLink ? (
        <>
          <h2>Your link</h2>
          <p>domain.com/{data.link}</p>
          <button onClick={goToEditPage}>Edit link</button>
        </>
      ) : (
        <form className="form-content" onSubmit={submitHandler}>
          <fieldset>
            <legend>Lets create a link</legend>
            <label htmlFor="link">
              <span className="sr-only">Link</span>
              <div className="input-wrapper">
                <span className="">domain.com/</span>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  id="link"
                  name="link"
                  required
                  type="text"
                />
              </div>
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="primary mt-2">
              Create
            </button>
          </fieldset>
        </form>
      )}
    </main>
  );
}

HomePage.defaultProps = {
  session: undefined,
  errorFromServer: undefined,
  hasLink: undefined,
  data: undefined,
};

HomePage.propTypes = {
  session: PropTypes.object,
  errorFromServer: PropTypes.string,
  hasLink: PropTypes.bool,
  data: PropTypes.object,
};

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: { destination: "/auth", permanent: false },
    };
  }
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
      email: session.user.email,
    });
  } catch (err) {
    return {
      props: {
        errorFromServer: "Couldn't do find operation ! Please try again later.",
      },
    };
  }

  if (user.data) {
    return {
      props: {
        hasLink: true,
        data: user.data,
        session,
      },
    };
  } else {
    return {
      props: {
        hasLink: false,
        session,
      },
    };
  }
}
