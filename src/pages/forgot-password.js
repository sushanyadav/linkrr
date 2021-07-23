import { useState } from "react";
import { getSession } from "next-auth/client";

import { validateEmail } from "utils/validate";

const sendEmail = async (email) => {
  // send magic link to user's email
  const response = await fetch(`/api/user/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      setError("Invalid Email");

      return;
    }

    try {
      setIsSubmitting(true);
      const result = await sendEmail(email);

      if (result) {
        setIsSubmitting(false);
        setFeedback(result.message);
      }
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container center-vph-w-header form-content">
      <form
        onSubmit={submitHandler}
        style={{ maxWidth: "420px", minWidth: "320px" }}
      >
        <fieldset>
          <legend>Forget password</legend>
          <label htmlFor="email">
            <span>Enter your email address</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              name="email"
              required
              type="email"
            />
          </label>
          {error && <p className="error">{error}</p>}
          {feedback && <p className="feedback">{feedback}</p>}
          <button disabled={isSubmitting} type="submit" className="primary">
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  return {
    props: { session },
  };
}

export default ForgotPasswordPage;
