import { getSession } from "next-auth/client";

import { validationSchema } from "utils/validate";
import dotToNestedObject from "utils/dotToNestedObject";

import { connectToDatabase } from "lib/db";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return;
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated !" });

    return;
  }
  const userEmail = session.user.email;

  try {
    await validationSchema.validate(req.body, {
      abortEarly: false,
    });
  } catch (error) {
    let errors = {};

    error.inner.forEach((e) => {
      errors = { ...errors, [e.path]: e.message };
    });

    res.status(422).json({
      message: "Form error",
      formErrors: dotToNestedObject(errors),
    });

    return;
  }

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    res.status(400).json({
      message: "Couldn't connect to database!",
    });

    return;
  }

  const userCollection = client.db().collection("users");

  let user;

  try {
    user = await userCollection.findOne({ email: userEmail });
  } catch (err) {
    res.status(404).json({ message: "User not found." });
    client.close();

    return;
  }

  if (!user) {
    res.status(422).json({ message: "Invalid user id." });
    client.close();

    return;
  }

  res.status(200).json({ message: "Success." });
};

export default handler;
