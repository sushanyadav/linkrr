import { Formik, Form } from "formik";
import { useState } from "react";
import { getSession } from "next-auth/client";

import TextInput from "components/Form/TextInput";
import Layout from "components/Layout";

import { forgotPasswordValidationSchema } from "utils/validate";

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
    throw data || "Something went wrong";
  }

  return data;
};

const ForgotPasswordPage = () => {
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const submitHandler = async (values, { setSubmitting, setErrors }) => {
    const { email } = values;

    setError("");
    setFeedback("");

    try {
      setSubmitting(true);
      const result = await sendEmail(email);

      if (result) {
        setSubmitting(false);
        setFeedback(result.message);
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

  const initialFormValues = {
    email: "",
  };

  return (
    <Layout>
      <div className="container center-vph-w-header form-content">
        <Formik
          initialValues={initialFormValues}
          validationSchema={forgotPasswordValidationSchema}
          onSubmit={submitHandler}
        >
          {({ isSubmitting }) => {
            return (
              <Form style={{ maxWidth: "420px", minWidth: "320px" }}>
                <fieldset>
                  <legend>Forget password</legend>
                  <TextInput
                    label="Email"
                    name="email"
                    type="text"
                    placeholder=""
                  />
                  {error && <p className="error">{error}</p>}
                  {feedback && <p className="feedback">{feedback}</p>}
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
