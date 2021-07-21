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
        let client;

        // Check if the user is authorized
        try {
          client = await connectToDatabase();
        } catch (error) {
          throw new Error("Couldn't connect to database!");
        }

        const userCollection = client.db().collection("users");
        let user;

        try {
          user = await userCollection.findOne({
            email: credentials.email,
          });
        } catch (error) {
          client.close();

          throw new Error("Couldn't do find operation !");
        }

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
          throw new Error("Couldn't log you in! Credential didn't match.");
        }

        client.close();

        return { email: user.email, provider: "credentials" };
      },
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        let client;

        // Check if the user is authorized
        try {
          client = await connectToDatabase();
        } catch (error) {
          throw new Error("Couldn't connect to database!");
        }

        const db = client.db();

        const userCollection = db.collection("users");
        let user;

        try {
          user = await userCollection.findOne({
            email: profile.email,
          });
        } catch (error) {
          client.close();

          throw new Error("Couldn't do find operation !");
        }

        if (!user) {
          try {
            await db.collection("users").insertOne({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              provider: "google",
            });
          } catch (error) {
            client.close();
            res.status(500).json({
              message: "Storing user failed.",
            });

            return;
          }
        }

        client.close();

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: "google",
        };
      },
    }),
    // ...add more providers here
  ],
  pages: { signIn: "/auth" },
  session: {
    jwt: process.env.JWT_AUTO_GENERATED_SIGNING_KEY, // for credentials
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY, // for google
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
});
