import { connectToDatabase } from "lib/db";

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

  res.status(201).json({ message: `Email sent to ${user.email}` });
  client.close();
};

export default handler;
