import { forgotPasswordValidationSchema } from "utils/validate";

import { connectToDatabase } from "lib/db";

const mail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

mail.setApiKey(process.env.SENDGRID_API_KEY);

const handler = async (req, res) => {
  if (req.method !== "POST") return;
  const data = req.body;
  const { email } = data;

  let client;

  try {
    await forgotPasswordValidationSchema.validate(req.body, {
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
    user = await userCollection.findOne({
      email,
    });
  } catch (err) {
    res.status(422).json({ message: "Couldn't find the user." });
    client.close();

    return;
  }

  if (!user) {
    res.status(422).json({ message: "User don't exists." });
    client.close();

    return;
  }

  if (!user.password) {
    res.status(422).json({
      message: `Cannot change your password. Use ${user.provider} to login to your account.`,
    });
    client.close();

    return;
  }

  const secret = process.env.JWT_AUTO_GENERATED_SIGNING_KEY + user.password;

  const payload = {
    email: user.email,
    id: user.id,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: "15m",
  });

  const link = `${
    process.env.BASE_URL
  }/reset-password/${user._id.toString()}/${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_VERIFY_SENDER_EMAIL, // Use the email address or domain you verified above
    subject:
      "Hello! Here is your password reset link which is valid for 15 minutes.",
    text: "Link is valid only for 15 minutes.",
    html: `<a href=${link}>Click here to reset your password</a>`,
  };

  try {
    await mail.send(msg);

    res
      .status(200)
      .json({ message: `Password reset link is sent to ${user.email}` });
    client.close();

    return;
  } catch (error) {
    res.status(401).json({
      message: `Email couldn't be sent. ${error.message}`,
    });
    client.close();

    return;
  }
};

export default handler;
