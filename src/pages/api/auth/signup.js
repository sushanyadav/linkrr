import { signUpValidationSchema } from "utils/validate";

import { connectToDatabase } from "lib/db";
import { hashPassword } from "lib/auth";

const handler = async (req, res) => {
  if (req.method !== "POST") return;
  const data = req.body;

  const { email, firstName, lastName, password } = data;

  try {
    await signUpValidationSchema.validate(req.body, {
      abortEarly: false,
    });
  } catch (error) {
    let errors = {};

    error.inner.forEach((e) => {
      errors = { ...errors, [e.path]: e.message };
    });

    res.status(422).json({
      message: "Form error",
      formErrors: errors,
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

  const db = client.db();

  const existingUser = await db.collection("users").findOne({ email });

  if (existingUser) {
    res.status(422).json({ message: "User already exists." });
    client.close();

    return;
  }

  const hashedPassword = await hashPassword(password);

  try {
    const result = await db.collection("users").insertOne({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      provider: "credentials",
    });

    res.status(201).json({ message: "Created user!", result });
    client.close();
  } catch (error) {
    client.close();
    res.status(500).json({
      message: "Storing user failed.",
    });

    return;
  }
};

export default handler;
