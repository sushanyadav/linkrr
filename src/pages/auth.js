import { useState } from "react";
import { signIn, getSession } from "next-auth/client";
import { useRouter } from "next/router";

import { validateEmail, validatePassword } from "utils/validate";

const createUser = async (email, password) => {
  // create user
  const response = await fetch(`/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const switchAuthModeHandler = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
    setError("");
    setIsLogin((prevState) => !prevState);
  };

  const login = async () => {
    const result = await signIn("login", {
      redirect: false,
      email: email,
      password: password,
    });

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace("/");
    }
  };

  const loginWithGoogle = async () => {
    const result = await signIn("google", {
      redirect: false,
    });

    if (result) {
      setIsSubmitting(false);
    } else {
      router.replace("/");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isLogin) {
      setIsSubmitting(true);
      login();
    } else {
      if (!isEmailValid) {
        setError("Invalid Email");

        return;
      }

      if (!isPasswordValid) {
        setError(
          "Invalid password. Password must be minimum eight characters, at least one letter and one number."
        );

        return;
      }

      if (confirmPassword !== password) {
        setError("Confirm password didn't match with password");

        return;
      }

      try {
        setIsSubmitting(true);
        const result = await createUser(email, password);

        if (result) {
          login();
        }
      } catch (error) {
        setError(error.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container center-vph-w-header">
      <div className="form-content login-content">
        <form onSubmit={submitHandler}>
          <fieldset>
            <legend>
              {isLogin ? "Login in to" : "Sign up for"} an account
            </legend>
            <label htmlFor="email">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                required
                type="text"
              />
            </label>
            <label htmlFor="password">
              <span>Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                required
                type="password"
              />
            </label>
            {!isLogin && (
              <label htmlFor="confirm-password">
                <span>Confirm Password</span>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="confirm-password"
                  name="confirm-password"
                  required
                  type="password"
                />
              </label>
            )}
            {error && <p className="error">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="primary">
              {isSubmitting ? "Submitting" : "Submit"}
            </button>
          </fieldset>
        </form>
        <hr className="separator" />
        <span className="or">OR</span>
        <button className="primary" onClick={loginWithGoogle}>
          {isLogin ? "Login in" : "Sign up"} using google
        </button>
        <button className="auth-switcher" onClick={switchAuthModeHandler}>
          {isLogin
            ? "No account yet? Register"
            : "Already have an account! Login"}
        </button>
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
