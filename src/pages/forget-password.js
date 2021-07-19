import { useState } from "react";

import { validateEmail } from "utils/validate";

const sendEmail = async (email) => {
  // create user
  const response = await fetch(`/api/user/forget-password`, {
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

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
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
        setFeedback("Email sent");
      }
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container center-vph-w-header form-content">
      <form onSubmit={submitHandler}>
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
              type="text"
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

export default ForgetPasswordPage;
