import { Formik, Form } from "formik";
import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/client";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import TextInput from "components/Form/TextInput";
import Button from "components/Button";

import { loginValidationSchema, signUpValidationSchema } from "utils/validate";

import googleLogo from "assets/images/google_logo.png";

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

  const initialTooltipValues = {
    email: false,
    password: false,
    confirmPassword: false,
  };

  const [showToolTip, setShowToolTip] = useState({ ...initialTooltipValues });

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

  const openToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: true });
  };

  const closeToolTip = (field) => {
    setShowToolTip({ ...showToolTip, [field]: false });
  };

  const openAllToolTip = () => {
    Object.keys(showToolTip).forEach(function (key) {
      showToolTip[key] = true;
    });

    setTimeout(() => {
      reset();
    }, 1000);
  };

  const reset = () => {
    setShowToolTip(initialTooltipValues);
  };

  const initialFormValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  return (
    <div className="bg-gradient">
      <div className="container center-vph">
        <div className="form">
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
                    <legend className="form__head">
                      {isLogin
                        ? "Sign in to an account"
                        : "Sign up for an account"}
                    </legend>
                    <Button
                      className="btn--primary"
                      type="button"
                      onClick={loginWithGoogle}
                      text={`${isLogin ? "Sign in" : "Sign up"} with Google`}
                      icon={
                        <Image
                          className="btn__img"
                          src={googleLogo}
                          alt="google"
                        />
                      }
                    />
                    <div className="divider">OR</div>

                    <TextInput
                      label="Email"
                      name="email"
                      type="text"
                      showToolTip={showToolTip.email}
                      openToolTip={() => openToolTip("email")}
                      closeToolTip={() => closeToolTip("email")}
                    />
                    <TextInput
                      label="Password"
                      name="password"
                      type="password"
                      showToolTip={showToolTip.password}
                      openToolTip={() => openToolTip("password")}
                      closeToolTip={() => closeToolTip("password")}
                    />

                    {!isLogin && (
                      <TextInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        showToolTip={showToolTip.confirmPassword}
                        openToolTip={() => openToolTip("confirmPassword")}
                        closeToolTip={() => closeToolTip("confirmPassword")}
                      />
                    )}

                    {error && <p className="error">{error}</p>}
                    <Button
                      className="btn--primary"
                      type="submit"
                      text={
                        isLogin
                          ? isSubmitting
                            ? "Signing in..."
                            : "Sign up"
                          : isSubmitting
                          ? "Signing up..."
                          : "Sign up"
                      }
                      disabled={isSubmitting}
                      onClick={openAllToolTip}
                    />
                  </fieldset>
                  <div className="switchers">
                    {isLogin && (
                      <>
                        <Link href="/forgot-password">
                          <a className="forgot-password">Forgot Password</a>
                        </Link>
                      </>
                    )}
                    <div className="dont-have-account-text">
                      <span>
                        {isLogin
                          ? "Don’t have an account"
                          : "Already have an account?"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          switchAuthModeHandler(resetForm, setErrors)
                        }
                      >
                        {isLogin ? "Sign Up" : "Sign In"}
                      </button>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
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

export default AuthPage;
