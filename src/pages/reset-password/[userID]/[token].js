import { Formik, Form } from "formik";
import { ObjectId } from "mongodb";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

import TextInput from "components/Form/TextInput";
import Layout from "components/Layout";

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
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

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

  return (
    <Layout>
      <div className="container center-vph-w-header">
        <Formik
          initialValues={initialFormValues}
          validationSchema={resetPasswordValidationSchema}
          onSubmit={submitHandler}
        >
          {({ isSubmitting }) => {
            return (
              <Form style={{ maxWidth: "420px", minWidth: "320px" }}>
                <fieldset>
                  <legend>Change password for {payload.email}</legend>
                  <TextInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder=""
                  />
                  <TextInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder=""
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
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="primary"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </fieldset>
              </Form>
            );
          }}
        </Formik>
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
