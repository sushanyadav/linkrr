import { getSession } from "next-auth/client";

import { validationSchema } from "utils/validate";
import dotToNestedObject from "utils/dotToNestedObject";

import { connectToDatabase } from "lib/db";

const imageToBase64 = require("image-to-base64");
const mail = require("@sendgrid/mail");
const CryptoJS = require("crypto-js");

const { cloudinary } = require("utils/cloudinary");

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

  // Connecting to database
  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    res.status(400).json({
      message: "Couldn't connect to database!",
    });

    return;
  }

  // insert user data to database
  const userCollection = client.db().collection("users");

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

  const {
    contactForm: { toggle: reqToggle },
  } = req.body;
  const {
    contactForm: { toggle: userToggle },
  } = user.data;

  // decrypting to compare
  let compareAbleContactApiKey = user.data.contactForm.apiKey;

  if (reqToggle && userToggle) {
    const bytes = CryptoJS.AES.decrypt(
      user.data.contactForm.apiKey,
      process.env.SEND_GRID_API_KEY_SECRET
    );

    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    compareAbleContactApiKey = decryptedData.toString();
  }

  const comparableUserDataProfileImage = await imageToBase64(
    user.data.personalDetails.profileImage
  );

  const comparableReqProfileImage =
    req.body.personalDetails.profileImage.replace(/^.+,/, "");

  const newRequestToCompare = {
    ...req.body,
    personalDetails: {
      ...req.body.personalDetails,
      profileImage: comparableReqProfileImage,
    },
  };

  const newUserDataToCompare = {
    ...user.data,
    personalDetails: {
      ...user.data.personalDetails,
      profileImage: comparableUserDataProfileImage,
    },
    contactForm: {
      ...user.data.contactForm,
      apiKey: compareAbleContactApiKey,
    },
  };

  //* comparing to verify
  if (
    JSON.stringify(newUserDataToCompare) === JSON.stringify(newRequestToCompare)
  ) {
    res.status(401).json({
      message: "No changes found",
    });

    client.close();

    return;
  }

  if (user.data.link !== req.body.link) {
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
  }

  //* checking if api key is valid
  if (
    reqToggle &&
    user.data.contactForm.apiKey !== req.body.contactForm.apiKey
  ) {
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
      client.close();

      return;
    }
  }

  //* save the profile photo to cloudinary
  if (comparableReqProfileImage !== user.data.personalDetails.profileImage) {
    let profileImageUrl;

    const publicId = user.data.personalDetails.profileImage
      .substring(
        user.data.personalDetails.profileImage.lastIndexOf("/user_profile") + 1
      )
      .split(".")[0];

    cloudinary.uploader.destroy(publicId, function (error, result) {
      if (error) {
        res.status(401).json({
          message: "Something went wrong",
        });
        client.close();

        return;
      }
    });

    try {
      const uploadedResponse = await cloudinary.uploader.upload(
        req.body.personalDetails.profileImage,
        {
          upload_preset: "user_profile",
        }
      );

      profileImageUrl = uploadedResponse.secure_url;
      req.body.personalDetails.profileImage = profileImageUrl;
    } catch (error) {
      client.close();
      res.status(500).json({
        message: error.message,
      });

      return;
    }
  }

  let updated = {};

  // Encrypt
  if (
    reqToggle &&
    user.data.contactForm.apiKey !== req.body.contactForm.apiKey
  ) {
    req.body.contactForm.apiKey = CryptoJS.AES.encrypt(
      req.body.contactForm.apiKey,
      process.env.SEND_GRID_API_KEY_SECRET
    ).toString();

    updated = { ...req.body };
  } else {
    updated = { ...req.body, contactForm: { ...user.data.contactForm } };
  }

  try {
    await userCollection.updateOne(
      { email: userEmail },
      { $set: { data: updated } }
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
