import { useState } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";

export default function HomePage({ session }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const submitHandler = (e) => {
    e.preventDefault();
    if (!link || link.trim() === "") {
      setError("Required");

      return;
    }

    router.push({
      pathname: "/create",
      query: { link: link.trim() },
    });
  };

  return (
    <main className="container center-vph-w-header flex flex-col">
      <h1 className="main-text">
        Logged in from <strong>{session.user.email}</strong>
      </h1>
      <form className="form-content" onSubmit={submitHandler}>
        <fieldset>
          <legend>Lets create a link</legend>
          <label htmlFor="link">
            <span className="sr-only">Link</span>
            <div className="input-wrapper">
              <span className="">domain.com/</span>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                id="link"
                name="link"
                required
                type="text"
              />
            </div>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary mt-2">
            Create
          </button>
        </fieldset>
      </form>
    </main>
  );
}

HomePage.defaultProps = {};

HomePage.propTypes = {
  session: PropTypes.object.isRequired,
};

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: { destination: "/auth", permanent: false },
    };
  }

  return {
    props: { session },
  };
}
