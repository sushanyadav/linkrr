import { validateEmail, validatePassword } from "utils/validate";

import { connectToDatabase } from "lib/db";
import { hashPassword } from "lib/auth";

const handler = async (req, res) => {
  if (req.method !== "POST") return;
  const data = req.body;

  const { email, password } = data;

  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);

  if (!isEmailValid) {
    res.status(422).json({ message: "Invalid Email." });

    return;
  }

  if (!isPasswordValid) {
    res.status(422).json({
      message:
        "Invalid password. Password must be minimum eight characters, at least one letter and one number.",
    });

    return;
  }

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    throw new Error("Couldn't connect to database!");
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
    const result = await db
      .collection("users")
      .insertOne({ email, password: hashedPassword, provider: "credentials" });

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
