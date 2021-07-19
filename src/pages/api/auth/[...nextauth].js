import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { connectToDatabase } from "lib/db";
import { verifyPassword } from "lib/auth";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      id: "login",
      async authorize(credentials) {
        // Check if the user is authorized
        const client = await connectToDatabase();

        const userCollection = client.db().collection("users");

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
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        const client = await connectToDatabase();

        const db = client.db();

        const userCollection = db.collection("users");

        const user = await userCollection.findOne({
          email: profile.email,
        });

        if (!user) {
          await db.collection("users").insertOne({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            provider: "google",
          });
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    // ...add more providers here
  ],
  pages: { signIn: "/auth" },
  session: {
    jwt: process.env.JWT_AUTO_GENERATED_SIGNING_KEY,
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
});
