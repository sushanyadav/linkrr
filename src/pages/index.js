import PropTypes from "prop-types";
import { getSession } from "next-auth/client";
export default function HomePage({ session }) {
  return (
    <main className="container center-vph-w-header flex flex-col">
      <h1>Lets create a link</h1>

      <p>
        Logged in from <strong>{session.user.email}</strong>
      </p>
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
