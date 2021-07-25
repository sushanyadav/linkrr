import { array, bool, object, string } from "yup";

export function validateEmail(requiredEmail) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(String(requiredEmail).toLowerCase());
}

export function validatePassword(requiredPassword) {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  return re.test(String(requiredPassword).toLowerCase());
}

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
      then: string().required("Required"),
    }),
    apiKey: string().when("toggle", {
      is: true,
      then: string().required("Required"),
    }),
  }),
});
