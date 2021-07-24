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

  //* FILE IMAGE VALIDATION
  if (!values.profileImage) {
    errors.profileImage = "Required";
  } else if (SUPPORTED_FORMATS.includes(values.profileImage.type) === false) {
    errors.profileImage =
      "File type not supported. File must be jpg, jpeg, gif or png.";
  } else if (values.profileImage.size / 1024 / 1024 > 2) {
    // more than 2 mb
    errors.profileImage = "File size too large. File must be less than 2 mb.";
  }

  //* SOCIAL LINKS VALIDATION

  // socials[0].link
  if (values.socials.length < 1) {
    errors.socials = "Socials must have at least 1 link.";
  } else {
    errors.socials = [];
    values.socials.forEach((social, index) => {
      const addSocialErrors = (field, errorMessage) => {
        return { ...errors.socials[index], [field]: errorMessage };
      };

      if (!social.name || social.name.trim() === "") {
        errors.socials[index] = addSocialErrors("name", "Required");
      }
      if (!social.link || social.link.trim() === "") {
        errors.socials[index] = addSocialErrors("link", "Required");
      }

      if (!social.icon) {
        errors.socials[index] = addSocialErrors("icon", "Required");
      } else if (SUPPORTED_FORMATS.includes(social.icon.type) === false) {
        errors.socials[index] = addSocialErrors(
          "icon",
          "File type not supported. File must be jpg, jpeg, gif or png."
        );
      } else if (social.icon.size / 1024 / 1024 > 2) {
        // more than 2 mb
        errors.socials[index] = addSocialErrors(
          "icon",
          "File size too large. File must be less than 2 mb."
        );
      }
    });
  }

  return errors;
};
