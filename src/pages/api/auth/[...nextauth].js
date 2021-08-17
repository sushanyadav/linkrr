import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { loginValidationSchema } from "utils/validate";

import { connectToDatabase } from "lib/db";
import { verifyPassword } from "lib/auth";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      id: "login",
      async authorize(credentials) {
        try {
          await loginValidationSchema.validate(credentials, {
            abortEarly: false,
          });
        } catch (error) {
          let errors = {};

          error.inner.forEach((e) => {
            errors = { ...errors, [e.path]: e.message };
          });

          throw new Error(
            "Credentials invalid. Please check your credentials and try submitting it again."
          );
        }

        let client;

        // Check if the user is exists
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

          throw new Error(
            "Couldn't do find operation ! Please try again later."
          );
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

        return {
          email: user.email,
          name:
            user.firstName || user.lastName
              ? `${user.firstName} ${user.lastName}`
              : null,
          image: user?.data?.personalDetails?.profileImage,
          provider: "credentials",
        };
      },
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn(user, account, profile) {
      if (account.type === "credentials") {
        return true;
      }

      if (account.provider === "google") {
        let client;

        // Checking if the user already has credentials account
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
          throw new Error(
            "Couldn't do find operation ! Please try again later."
          );
        }
        if (user && user.provider === "credentials") {
          client.close();
          throw new Error("Couldn't login. Use credentials to login instead !");
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
            throw new Error("Storing user failed.");
          }
        }
        client.close();

        return true;
      }
    },
  },
  pages: { signIn: "/auth", error: "/auth" },
  session: {
    jwt: process.env.JWT_AUTO_GENERATED_SIGNING_KEY, // for credentials
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY, // for google
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
});
