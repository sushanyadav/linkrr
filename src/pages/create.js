import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import ConfigureLink from "components/ConfigureLink";

export default function CreatePage() {
  const router = useRouter();

  const [link, setLink] = useState("");

  const { link: linkFromQuery } = router.query;

  useEffect(() => {
    if (linkFromQuery) {
      setLink(linkFromQuery);
      window.history.replaceState(null, "", router.pathname);
    }
  }, [linkFromQuery, router]);

  return (
    <section className="container">
      <ConfigureLink heading="Create" link={link} />
    </section>
  );
}

CreatePage.defaultProps = {};

CreatePage.propTypes = {
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
