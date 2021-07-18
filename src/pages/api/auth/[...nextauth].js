import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { connectToDatabase } from "lib/db";
import { verifyPassword } from "lib/auth";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        // Check if the user is authorized
        const client = await connectToDatabase();

        const userCollection = await client.db().collection("users");

        const user = await userCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error("Couldn't log you in!");
        }

        client.close();

        return { email: user.email };
      },
    }),
    // ...add more providers here
  ],
  session: {
    jwt: true,
  },
});
