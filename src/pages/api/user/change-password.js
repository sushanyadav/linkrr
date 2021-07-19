import { getSession } from "next-auth/client";

import { connectToDatabase } from "lib/db";
import { verifyPassword, hashPassword } from "lib/auth";

const handler = async (req, res) => {
  if (req.method !== "PATCH") {
    return;
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated !" });

    return;
  }

  const userEmail = session.user.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (!newPassword || newPassword.trim().length < 7) {
    res.status(422).json({
      message: "Invalid input - password should be at least 7 characters long.",
    });

    return;
  }

  const client = await connectToDatabase();

  const userCollection = client.db().collection("users");

  const user = await userCollection.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: "User not found." });
    client.close();

    return;
  }

  const currentPassword = user.password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    res.status(403).json({ message: "Invalid Password." });

    client.close();

    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  await userCollection.updateOne(
    { email: userEmail },
    { $set: { password: hashedPassword } }
  );

  client.close();
  res.status(200).json({ message: "Password updated !" });
};

export default handler;
