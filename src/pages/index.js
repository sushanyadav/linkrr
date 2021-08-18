import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";

import Layout from "components/Layout";
import Button from "components/Button";

import { connectToDatabase } from "lib/db";

export default function HomePage({
  session,
  baseUrl,
  errorFromServer,
  hasLink,
  data,
}) {
  const initialTooltipValues = {
    link: false,
  };

  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGotoPreviewIcon, setShowGotoPreviewIcon] = useState(false);
  const [showToolTip, setShowToolTip] = useState({ ...initialTooltipValues });

  const router = useRouter();
  const { error: errorFromProvider, link: linkFromServer } = router.query;

  useEffect(() => {
    if (errorFromProvider) {
      setError(errorFromProvider);
      setLink(linkFromServer);
      setIsSubmitting(false);
      openAllToolTip();
      window.history.replaceState(null, "", router.pathname);
    }
    // eslint-disable-next-line
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

  const reset = () => {
    setShowToolTip(initialTooltipValues);
  };

  const openAllToolTip = () => {
    Object.keys(showToolTip).forEach(function (key) {
      showToolTip[key] = true;
    });

    setTimeout(() => {
      reset();
    }, 2000);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setError("");
    openAllToolTip();
    setIsSubmitting(true);
    if (hasLink) {
      router.push({
        pathname: "/edit",
      });

      return;
    }

    if (!link || link.trim() === "") {
      setError("Required");
      setIsSubmitting(false);

      return;
    }

    router.push({
      pathname: "/create",
      query: { link: link.trim() },
    });
  };

  const openToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: true });
  };

  const closeToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: false });
  };

  return (
    <Layout>
      <div className="homepage">
        <main className="container">
          <div className="homepage__content">
            <form onSubmit={submitHandler}>
              <fieldset>
                <legend>
                  {hasLink
                    ? "Your Link 🔗"
                    : "Lets create one link to house all of your links 🔗"}
                </legend>

                <div className="form flex">
                  <div className="input-wrapper">
                    <input
                      disabled={hasLink}
                      type="text"
                      className="form-input form-input__create-link"
                      value={link}
                      id="link"
                      name="link"
                      placeholder={!hasLink && "enter your link"}
                      onChange={(e) => {
                        !hasLink && setLink(e.target.value), setError("");
                      }}
                      onMouseLeave={() => setShowGotoPreviewIcon(false)}
                      onMouseOver={() => setShowGotoPreviewIcon(true)}
                    />
                    {error && (
                      <div className="notification-wrapper">
                        <div
                          onMouseOver={() => openToolTip("link")}
                          onMouseLeave={() => closeToolTip("link")}
                          data-error={error}
                          className={`${
                            showToolTip.link ? "show-tooltip" : ""
                          } notification-icon error`}
                        >
                          !
                        </div>
                      </div>
                    )}
                    <span className="edit_link">{baseUrl}/</span>

                    {!error && hasLink && (
                      <>
                        <span className="edit_link">
                          {baseUrl}/<span>{data.link}</span>
                        </span>
                        <a
                          target="_blank"
                          href={`${baseUrl}/${data.link}`}
                          rel="noreferrer"
                        >
                          <div className="goto-icon">
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
                        </a>
                      </>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn--primary width-auto"
                    text={
                      isSubmitting
                        ? "Please wait..."
                        : hasLink
                        ? "Edit"
                        : "Create Link"
                    }
                    icon={
                      hasLink ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill="#fff"
                            d="M9.99 3.654l-7.543 7.543-.164 1.796a.667.667 0 00.725.724l1.796-.163 7.542-7.543L9.99 3.654zM12.818 5.54l1.414-1.414a.667.667 0 000-.943l-1.414-1.414a.667.667 0 00-.943 0L10.46 3.183l2.357 2.357z"
                          ></path>
                        </svg>
                      ) : undefined
                    }
                    iconLeft
                  />
                </div>
              </fieldset>
            </form>
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
  baseUrl: PropTypes.string.isRequired,
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
        baseUrl: process.env.BASE_URL,
      },
    };
  } else {
    return {
      props: {
        hasLink: false,
        session,
        baseUrl: process.env.BASE_URL,
      },
    };
  }
}
