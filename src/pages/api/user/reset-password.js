import { connectToDatabase } from "lib/db";
import { hashPassword } from "lib/auth";

const jwt = require("jsonwebtoken");

const handler = async (req, res) => {
  if (req.method !== "PATCH") {
    return;
  }
  const { payload, newPassword, confirmNewPassword, query } = req.body;

  const { token } = query;
  const { email } = payload;

  if (confirmNewPassword !== newPassword) {
    res
      .status(422)
      .json({ message: "Confirm password didn't match with password." });

    return;
  }

  const client = await connectToDatabase();

  const userCollection = client.db().collection("users");

  const user = await userCollection.findOne({
    email,
  });

  if (!user) {
    res.status(404).json({ message: "Invalid user id." });
    client.close();

    return;
  }

  const secret = process.env.JWT_AUTO_GENERATED_SIGNING_KEY + user.password;

  try {
    const { email: payloadEmail } = jwt.verify(token, secret);

    const hashedPassword = await hashPassword(newPassword);

    await userCollection.updateOne(
      { email: payloadEmail },
      { $set: { password: hashedPassword } }
    );
    client.close();
    res.status(200).json({ message: "Password updated !" });
  } catch (error) {
    client.close();
    res.status(422).json({ message: error.message });

    return;
  }
};

export default handler;
