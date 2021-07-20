import { connectToDatabase } from "lib/db";

const jwt = require("jsonwebtoken");
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const handler = async (req, res) => {
  if (req.method !== "POST") return;
  const data = req.body;
  const { email } = data;

  const client = await connectToDatabase();

  const userCollection = client.db().collection("users");

  const user = await userCollection.findOne({
    email,
  });

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

  // send this link to email to reset password
  const mailGunData = {
    from: "Linkrr <sushanyadav98@gmail.com>",
    to: email,
    subject:
      "Hello! Here is your password reset link which is valid for 15 minutes.",
    html: `<a href=${link}>Reset your password</a>`,
  };

  try {
    await mailgun.messages().send(mailGunData);
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
