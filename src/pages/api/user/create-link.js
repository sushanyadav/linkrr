import { getSession } from "next-auth/client";

import { validationSchema } from "utils/validate";
import dotToNestedObject from "utils/dotToNestedObject";

import { connectToDatabase } from "lib/db";

const mail = require("@sendgrid/mail");
const CryptoJS = require("crypto-js");

const { cloudinary } = require("utils/cloudinary");

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return;
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated !" });

    return;
  }
  const userEmail = session.user.email;

  try {
    await validationSchema.validate(req.body, {
      abortEarly: false,
    });
  } catch (error) {
    let errors = {};

    error.inner.forEach((e) => {
      errors = { ...errors, [e.path]: e.message };
    });

    res.status(422).json({
      message: "Form error",
      formErrors: dotToNestedObject(errors),
    });

    return;
  }

  //* Connecting to database
  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    res.status(400).json({
      message: "Couldn't connect to database!",
    });

    return;
  }

  const userCollection = client.db().collection("users");
  let listExists;

  try {
    listExists = await userCollection.findOne({
      "data.link": req.body.link,
    });
  } catch (error) {
    res.status(400).json({
      message: "link checking failed!",
    });
  }

  if (listExists) {
    res.status(400).json({
      message: "Link already exists!",
    });

    return;
  }

  //* checking if api key is valid
  const {
    contactForm: { toggle },
  } = req.body;

  if (toggle) {
    const { apiKey, apiEmailAddress } = req.body.contactForm;

    mail.setApiKey(apiKey);

    const msg = {
      to: apiEmailAddress,
      from: apiEmailAddress, // Use the email address or domain you verified above
      subject: "API Key is now connected.",
      text: "Api key has been successfully connected.",
    };

    try {
      await mail.send(msg);
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });

      return;
    }
  }

  //* save the profile photo to cloudinary
  let profileImageUrl;

  try {
    const uploadedResponse = await cloudinary.uploader.upload(
      req.body.personalDetails.profileImage,
      {
        upload_preset: "user_profile",
      }
    );

    profileImageUrl = uploadedResponse.secure_url;
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

  //* insert user data to database
  let user;

  try {
    user = await userCollection.findOne({
      email: userEmail,
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

  try {
    req.body.personalDetails.profileImage = profileImageUrl;
    // Encrypt
    if (toggle) {
      req.body.contactForm.apiKey = CryptoJS.AES.encrypt(
        req.body.contactForm.apiKey,
        process.env.SEND_GRID_API_KEY_SECRET
      ).toString();
    }

    await userCollection.updateOne(
      { email: userEmail },
      { $set: { data: req.body } }
    );
    client.close();
    res.status(200).json({ message: "Link addded !" });
  } catch (error) {
    client.close();
    res.status(422).json({ message: error.message });

    return;
  }
};

export default handler;
