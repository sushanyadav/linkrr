import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import Link from "next/link";

import ConfigureLink from "components/ConfigureLink";
import Layout from "components/Layout";

import { connectToDatabase } from "lib/db";

export default function CreatePage({ errorFromServer }) {
  const router = useRouter();

  const [link, setLink] = useState("");

  const { link: linkFromQuery } = router.query;

  useEffect(() => {
    if (linkFromQuery) {
      setLink(linkFromQuery);
      window.history.replaceState(null, "", router.pathname);
    }
  }, [linkFromQuery, router]);

  if (errorFromServer) {
    return (
      <Layout>
        <div className="container center-vph-w-header">
          {errorFromServer === "link_exists" ? (
            <p>
              You have already created the link. Visit{" "}
              <Link href="/">here</Link> to edit.
            </p>
          ) : (
            <h1>{errorFromServer}</h1>
          )}
        </div>
      </Layout>
    );
  }

  const initialFormValues = {
    link: link,
    personalDetails: {
      profileImage: "",
      name: "",
      title: "",
      backgroundColor: "#7C3AED",
    },
    socials: {
      socials: [{ name: "", link: "" }],
      showFavicon: true,
    },
    contactForm: { toggle: false, apiEmailAddress: "", apiKey: "" },
  };

  return (
    <Layout>
      <section className="container">
        <ConfigureLink heading="Create" initialFormValues={initialFormValues} />
      </section>
    </Layout>
  );
}

CreatePage.defaultProps = {
  session: undefined,
  errorFromServer: undefined,
};

CreatePage.propTypes = {
  session: PropTypes.object,
  errorFromServer: PropTypes.string,
};

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  const { link } = context.query;

  if (!session) {
    return {
      redirect: { destination: "/auth", permanent: false },
    };
  }

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    return {
      props: {
        errorFromServer: "Couldn't connect to database!",
      },
    };
  }

  const userCollection = client.db().collection("users");

  if (link) {
    let hasLink;

    try {
      hasLink = await userCollection.findOne({
        "data.link": link,
      });
    } catch (err) {
      return {
        props: {
          errorFromServer:
            "Couldn't do search link operation ! Please try again later.",
        },
      };
    }

    if (hasLink) {
      return {
        // redirect with query params
        redirect: {
          destination: `/?link=${link}&error=link already exists`,
        },
      };
    }
  }

  let user;

  try {
    user = await userCollection.findOne({
      email: session.user.email,
    });
  } catch (err) {
    return {
      props: {
        errorFromServer: "Couldn't do find operation ! Please try again later.",
      },
    };
  }

  if (user.data) {
    return {
      props: {
        errorFromServer: "link_exists",
      },
    };
  }

  return {
    props: { session },
  };
}
