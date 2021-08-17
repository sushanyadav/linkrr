import { Formik, Form } from "formik";
import { ObjectId } from "mongodb";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

import TextInput from "components/Form/TextInput";
import Layout from "components/Layout";
import Button from "components/Button";

import { resetPasswordValidationSchema } from "utils/validate";

import { connectToDatabase } from "lib/db";

const changePassword = async (
  payload,
  newPassword,
  confirmNewPassword,
  query
) => {
  // send magic link to user's email
  const response = await fetch(`/api/user/reset-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload,
      newPassword,
      confirmNewPassword,
      query,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data || "Something went wrong";
  }

  return data;
};

const ResetPassword = ({ errorFromServer, payload }) => {
  const initialTooltipValues = {
    password: false,
    confirmPassword: false,
  };
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showToolTip, setShowToolTip] = useState({ ...initialTooltipValues });

  const router = useRouter();

  const submitHandler = async (values, { setSubmitting, setErrors }) => {
    const { confirmPassword, password } = values;

    setError("");
    setFeedback("");

    try {
      setSubmitting(true);
      const result = await changePassword(
        payload,
        password,
        confirmPassword,
        router.query
      );

      if (result) {
        setSubmitting(false);
        setFeedback("Password changed");
      }
    } catch (error) {
      if (error.message === "Form error") {
        setErrors({ ...error.formErrors });
        setSubmitting(false);

        return;
      }
      setError(error.message);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let timer;

    if (feedback) {
      timer = setTimeout(() => {
        router.replace("/");
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [feedback, router]);

  if (!payload || errorFromServer) {
    return (
      <Layout>
        <div className="container center-vph-w-header">
          <h1>{errorFromServer.toUpperCase()}</h1>
        </div>
      </Layout>
    );
  }

  const initialFormValues = {
    confirmPassword: "",
    password: "",
  };

  const openToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: true });
  };

  const closeToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: false });
  };

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

  return (
    <Layout wrapperClassName="bg-gradient">
      <div className="container center-vph">
        <div className="form">
          <Formik
            initialValues={initialFormValues}
            validationSchema={resetPasswordValidationSchema}
            onSubmit={submitHandler}
          >
            {({ isSubmitting }) => {
              return (
                <Form>
                  <fieldset>
                    <div className="form__head">
                      <legend>Forget password</legend>
                      <small>Setting a new password for {payload.email}</small>
                    </div>

                    <TextInput
                      label="Password"
                      name="password"
                      type="password"
                      showToolTip={showToolTip.password}
                      openToolTip={() => openToolTip("password")}
                      closeToolTip={() => closeToolTip("password")}
                    />
                    <TextInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      showToolTip={showToolTip.confirmPassword}
                      openToolTip={() => openToolTip("confirmPassword")}
                      closeToolTip={() => closeToolTip("confirmPassword")}
                    />
                    {error && <p className="error">{error}</p>}
                    {feedback && (
                      <>
                        <p className="feedback">{feedback}</p>
                        <p className="feedback">
                          Redirecting you to log in page...
                        </p>
                      </>
                    )}
                    <Button
                      className="btn--primary"
                      type="submit"
                      text={
                        isSubmitting
                          ? "Changing password..."
                          : "Change password"
                      }
                      onClick={openAllToolTip}
                      disabled={isSubmitting}
                    />
                  </fieldset>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

ResetPassword.defaultProps = {
  errorFromServer: undefined,
  payload: undefined,
};

ResetPassword.propTypes = {
  errorFromServer: PropTypes.string,
  payload: PropTypes.object,
};

export async function getServerSideProps(context) {
  const { userID, token } = context.query;

  let client;

  // check if user exist in database
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

  if (!ObjectId.isValid(userID)) {
    return {
      props: {
        errorFromServer: "Invalid user id !!",
      },
    };
  }

  let user;

  try {
    user = await userCollection.findOne({
      _id: ObjectId(userID),
    });
  } catch (err) {
    return {
      props: {
        errorFromServer: "Couldn't do find operation ! Please try again later.",
      },
    };
  }

  if (!user) {
    client.close();

    return {
      props: {
        errorFromServer: "Invalid user id !!",
      },
    };
  }

  // As we have a valid id now we can check if the token is valid
  const secret = process.env.JWT_AUTO_GENERATED_SIGNING_KEY + user.password;

  try {
    const payload = jwt.verify(token, secret);

    client.close();

    return {
      props: {
        payload: payload,
      },
    };
  } catch (error) {
    client.close();

    return {
      props: {
        errorFromServer: error.message,
      },
    };
  }
}

export default ResetPassword;
