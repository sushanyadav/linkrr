export function validateEmail(requiredEmail) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(String(requiredEmail).toLowerCase());
}

export function validatePassword(requiredPassword) {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  return re.test(String(requiredPassword).toLowerCase());
}

export const validateLinkForm = (values) => {
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/png",
  ];
  const errors = {};

  //* NAME VALIDATION
  if (!values.name || values.name.trim() === "") {
    errors.name = "Required";
  }

  //* TITLE VALIDATION
  if (!values.title || values.title.trim() === "") {
    errors.title = "Required";
  }

  //* LINK VALIDATION
  if (!values.link || values.link.trim() === "") {
    errors.link = "Required";
  }
  // else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
  //   errors.email = "Invalid email address";
  // }

  //* FILE VALIDATION
  if (!values.file) {
    errors.file = "Required";
  } else if (SUPPORTED_FORMATS.includes(values.file.type) === false) {
    errors.file =
      "File type not supported. File must be jpg, jpeg, gif or png.";
  } else if (values.file.size / 1024 / 1024 > 2) {
    // more than 2 mb
    errors.file = "File size too large. File must be less than 2 mb.";
  }

  return errors;
};
