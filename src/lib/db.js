import { MongoClient } from "mongodb";

export const connectToDatabase = async () => {
  const client = await MongoClient.connect(process.env.DATABASE_URL);

  return client;
};
