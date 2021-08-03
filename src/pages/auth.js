import { Formik, Form } from "formik";
import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/client";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "components/Layout";
import TextInput from "components/Form/TextInput";

import { loginValidationSchema, signUpValidationSchema } from "utils/validate";

const createUser = async (email, password, confirmPassword) => {
  // create user
  const response = await fetch(`/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data || "Something went wrong";
  }

  return data;
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { error: errorFromProvider } = router.query;

  useEffect(() => {
    if (errorFromProvider) {
      setError(errorFromProvider);
      window.history.replaceState(null, "", router.pathname);
    }
  }, [errorFromProvider, router]);

  const switchAuthModeHandler = (resetForm, setErrors) => {
    resetForm();
    setError("");
    setErrors({ email: "", password: "", confirmPassword: "" });
    setIsLogin((prevState) => !prevState);
  };

  const login = async ({ email, password }) => {
    setSubmitting(true);

    const result = await signIn("login", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.replace("/");
    }
  };

  const loginWithGoogle = async () => {
    await signIn("google");
  };

  const submitHandler = async (values, { setErrors }) => {
    const { email, password } = values;

    setError("");

    if (isLogin) {
      await login({ email, password, setSubmitting });
    } else {
      try {
        setSubmitting(true);
        const result = await createUser(
          email,
          password,
          values.confirmPassword
        );

        if (result) {
          await login({ email, password, setSubmitting });
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
    }
  };

  const initialFormValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  return (
    <Layout>
      <div className="container center-vph-w-header">
        <div className="form-content login-content">
          <Formik
            initialValues={initialFormValues}
            validationSchema={
              isLogin ? loginValidationSchema : signUpValidationSchema
            }
            onSubmit={submitHandler}
          >
            {({ resetForm, setErrors }) => {
              return (
                <Form style={{ maxWidth: "420px", minWidth: "320px" }}>
                  <fieldset>
                    <legend>
                      {isLogin ? "Login in to" : "Sign up for"} an account
                    </legend>
                    <TextInput
                      label="Email"
                      name="email"
                      type="text"
                      placeholder=""
                    />
                    <TextInput
                      label="Password"
                      name="password"
                      type="password"
                      placeholder=""
                    />

                    {isLogin && (
                      <div>
                        <Link href="/forgot-password">
                          <a>
                            <small style={{ fontSize: "0.8rem" }}>
                              Forgot password
                            </small>
                          </a>
                        </Link>
                      </div>
                    )}

                    {!isLogin && (
                      <TextInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder=""
                      />
                    )}
                    {error && <p className="error">{error}</p>}
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="primary"
                    >
                      {isSubmitting ? "Submitting" : "Submit"}
                    </button>
                  </fieldset>
                  <hr className="separator" />
                  <span className="or" style={{ display: "block" }}>
                    OR
                  </span>
                  <button
                    className="primary"
                    style={{ display: "block" }}
                    type="button"
                    onClick={loginWithGoogle}
                  >
                    {isLogin ? "Login in" : "Sign up"} using google
                  </button>
                  <button
                    style={{ display: "block" }}
                    type="button"
                    className="auth-switcher"
                    onClick={() => switchAuthModeHandler(resetForm, setErrors)}
                  >
                    {isLogin
                      ? "No account yet? Register"
                      : "Already have an account! Login"}
                  </button>
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

export default AuthPage;
