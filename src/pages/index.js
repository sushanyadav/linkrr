import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";

import Layout from "components/Layout";
import Button from "components/Button";

import { connectToDatabase } from "lib/db";

export default function HomePage({ session, errorFromServer, hasLink, data }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGotoPreviewIcon, setShowGotoPreviewIcon] = useState(false);

  const router = useRouter();
  const { error: errorFromProvider, link: linkFromServer } = router.query;

  useEffect(() => {
    if (errorFromProvider) {
      setError(errorFromProvider);
      setLink(linkFromServer);
      setIsSubmitting(false);
      window.history.replaceState(null, "", router.pathname);
    }
  }, [errorFromProvider, linkFromServer, router]);

  if (errorFromServer) {
    return (
      <Layout>
        <div className="container center-vph-w-header">
          <h1>{errorFromServer}</h1>
        </div>
      </Layout>
    );
  }

  const submitHandler = (e) => {
    setError("");
    e.preventDefault();
    if (!link || link.trim() === "") {
      setError("Required");

      return;
    }
    setIsSubmitting(true);
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

  const gotoLink = () => {
    router.push({
      pathname: `${data.link}`,
    });
  };

  return (
    <Layout>
      <div className="homepage">
        <main className="container">
          <div className="homepage__content">
            {hasLink ? (
              <>
                <h1>Your Link 🔗</h1>
                <div className="flex">
                  <div className="input-wrapper">
                    <input
                      disabled
                      type="text"
                      className="form-input"
                      // value={`domain.com/${data.link}`}
                      onMouseLeave={() => setShowGotoPreviewIcon(false)}
                      onMouseOver={() => setShowGotoPreviewIcon(true)}
                    />

                    <div className="goto-icon" onClick={gotoLink}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        onMouseOver={() => setShowGotoPreviewIcon(true)}
                        className={showGotoPreviewIcon ? "show" : ""}
                        viewBox="0 0 32 32"
                      >
                        <rect width="32" height="32" rx="16"></rect>
                        <path
                          fill="#fff"
                          d="M8 17h12.17l-3.58 3.59L18 22l6-6-6-6-1.41 1.41L20.17 15H8v2z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <Button
                    onClick={goToEditPage}
                    className="btn--primary width-auto"
                    text="Edit"
                  />
                </div>
              </>
            ) : (
              <form className="" onSubmit={submitHandler}>
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
                        type="text"
                      />
                    </div>
                  </label>
                  {error && <p className="error">{error}</p>}
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className=" mt-2"
                  >
                    {isSubmitting ? "Creating..." : "Create"}
                  </button>
                </fieldset>
              </form>
            )}
          </div>
        </main>
      </div>
    </Layout>
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
