import { Formik, Form } from "formik";
import { useState } from "react";
import { getSession } from "next-auth/client";

import TextInput from "components/Form/TextInput";
import Layout from "components/Layout";
import Button from "components/Button";

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
  const initialTooltipValues = {
    email: false,
  };

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showToolTip, setShowToolTip] = useState({ ...initialTooltipValues });

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
            validationSchema={forgotPasswordValidationSchema}
            onSubmit={submitHandler}
          >
            {({ isSubmitting }) => {
              return (
                <Form className="">
                  <fieldset>
                    <div className="form__head">
                      <legend>Forget password</legend>
                      <small>
                        Please enter the registered email and we’ll send you a
                        password reset link
                      </small>
                    </div>
                    <TextInput
                      label="Email Address"
                      name="email"
                      type="text"
                      showToolTip={showToolTip.email}
                      openToolTip={() => openToolTip("email")}
                      closeToolTip={() => closeToolTip("email")}
                    />
                    {error && <p className="error">{error}</p>}
                    {feedback && <p className="feedback">{feedback}</p>}
                    <Button
                      className="btn--primary"
                      type="submit"
                      text={
                        isSubmitting
                          ? "Sending reset link..."
                          : "Send reset link"
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
