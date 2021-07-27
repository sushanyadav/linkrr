import PropTypes from "prop-types";
import { getSession } from "next-auth/client";
import Link from "next/link";
import { useEffect } from "react";

import ConfigureLink from "components/ConfigureLink";

import imageToBase64 from "utils/imageToBase64";

import { connectToDatabase } from "lib/db";

const CryptoJS = require("crypto-js");

export default function EditPage({ errorFromServer, initialFormValues }) {
  useEffect(() => {
    if (initialFormValues) {
      imageToBase64(
        initialFormValues.personalDetails.profileImage,
        function (myBase64) {
          initialFormValues.personalDetails.profileImage = myBase64;
        }
      );
    }
  }, [initialFormValues]);

  if (errorFromServer) {
    return (
      <div className="container center-vph-w-header">
        {errorFromServer === "link_don't_exists" ? (
          <p>
            You haven&apos;t created the link yet. Visit{" "}
            <Link href="/create">here</Link> to create your link.
          </p>
        ) : (
          <h1>{errorFromServer}</h1>
        )}
      </div>
    );
  }

  return (
    <section className="container">
      <ConfigureLink heading="Edit" initialFormValues={initialFormValues} />
    </section>
  );
}

EditPage.defaultProps = {
  session: undefined,
  initialFormValues: undefined,
  errorFromServer: undefined,
};

EditPage.propTypes = {
  session: PropTypes.object,
  initialFormValues: PropTypes.object,
  errorFromServer: PropTypes.string,
};

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

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

  if (!user.data) {
    return {
      props: {
        errorFromServer: "link_don't_exists",
      },
    };
  } else {
    const bytes = CryptoJS.AES.decrypt(
      user.data.contactForm.apiKey,
      process.env.SEND_GRID_API_KEY_SECRET
    );

    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    user.data.contactForm.apiKey = decryptedData.toString();

    return {
      props: {
        initialFormValues: user.data,
        session,
      },
    };
  }
}
