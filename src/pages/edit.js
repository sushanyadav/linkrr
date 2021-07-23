import PropTypes from "prop-types";
import { getSession } from "next-auth/client";

import ConfigureLink from "components/ConfigureLink";

export default function EditPage() {
  return (
    <section className="container">
      <ConfigureLink heading="Edit" />
    </section>
  );
}

EditPage.defaultProps = {};

EditPage.propTypes = {
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
