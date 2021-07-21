import { ObjectId } from "mongodb";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

import { validatePassword } from "utils/validate";

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
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const ResetPassword = ({ errorFromServer, payload }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const router = useRouter();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    const isPasswordValid = validatePassword(password);

    if (confirmPassword !== password) {
      setError("Confirm password didn't match with password");

      return;
    }
    if (!isPasswordValid) {
      setError(
        "Invalid password. Password must be minimum eight characters, at least one letter and one number."
      );

      return;
    }

    try {
      setIsSubmitting(true);
      const result = await changePassword(
        payload,
        password,
        confirmPassword,
        router.query
      );

      if (result) {
        setIsSubmitting(false);
        setFeedback("Password changed");
      }
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
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
      <div className="container center-vph-w-header">
        <h1>{errorFromServer.toUpperCase()}</h1>
      </div>
    );
  }

  return (
    <div className="container center-vph-w-header form-content">
      <form onSubmit={submitHandler}>
        <fieldset>
          <legend>Change password for {payload.email}</legend>
          <label htmlFor="password">
            <span>Enter your new password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              required
              type="password"
            />
          </label>
          <label htmlFor="confirmPassword">
            <span>Confirm your new password</span>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          {feedback && (
            <>
              <p className="feedback">{feedback}</p>
              <p className="feedback">Redirecting you to log in page...</p>
            </>
          )}
          <button disabled={isSubmitting} type="submit" className="primary">
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </fieldset>
      </form>
    </div>
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
        errorFromServer: "Couldn't find the user !!",
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
