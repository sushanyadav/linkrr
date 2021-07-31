import { array, bool, object, string, ref } from "yup";

export const loginValidationSchema = object().shape({
  email: string().required("Required").email("Invalid email address"),
  password: string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum."),
});

export const forgotPasswordValidationSchema = object().shape({
  email: string().required("Required").email("Invalid email address"),
});

export const resetPasswordValidationSchema = object().shape({
  password: string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum."),
  confirmPassword: string().oneOf(
    [ref("password"), null],
    "Passwords must match"
  ),
});

export const signUpValidationSchema = object().shape({
  email: string().required("Required").email("Invalid email address"),
  password: string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum."),
  confirmPassword: string().oneOf(
    [ref("password"), null],
    "Passwords must match"
  ),
});

const SUPPORTED_FORMATS = [
  "data:image/jpg;base64",
  "data:image/jpeg;base64",
  "data:image/gif;base64",
  "data:image/png;base64",
];

export const validationSchema = object().shape({
  link: string().min(2, "Too Short!").max(10, "Too Long!").required("Required"),
  personalDetails: object().shape({
    profileImage: string()
      .required("An image is required")
      .test("fileType", "Unsupported File Format", (value) => {
        if (value) {
          const format = value.split(",")[0];

          return SUPPORTED_FORMATS.includes(format);
        }
      })
      .test("fileSize", "File Size is too large", (value) => {
        if (value) {
          const stringLength = value.length - "data:image/png;base64,".length;

          const sizeInBytes =
            4 * Math.ceil(stringLength / 3) * 0.5624896334383812;

          const sizeInKb = sizeInBytes / 1000;

          if (sizeInKb > 2000) {
            return false;
          } else {
            return true;
          }
        }
      }),
    name: string().required("Required"),
    title: string().required("Required"),
    backgroundColor: string().required("Required"),
  }),
  socials: object().shape({
    socials: array(
      object().shape({
        name: string().required("Required"),
        link: string().required("Required"),
      })
    ),
    showFavicon: bool(),
  }),
  contactForm: object().shape({
    toggle: bool(),
    apiEmailAddress: string().when("toggle", {
      is: true,
      then: string().required("Required").email("Invalid email address"),
    }),
    apiKey: string().when("toggle", {
      is: true,
      then: string().required("Required"),
    }),
  }),
});
