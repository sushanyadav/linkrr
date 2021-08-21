import { Formik, Form, FieldArray } from "formik";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import ImageFileInput from "components/Form/ProfileImageFileInput";
import TextInput from "components/Form/TextInput";
import ColorInput from "components/Form/ColorInput";
import CheckboxInput from "components/Form/CheckboxInput";
import Button from "components/Button";

import { validationSchema } from "utils/validate";

const FormikForm = ({
  heading,
  setFieldValue,
  setFieldTouched,
  touched,
  errors,
  isSubmitting,
  values,
  getFormValues,
  baseUrl,
  getFormErrors,
  initialFormValues,
  path,
}) => {
  useEffect(() => {
    getFormValues(values);
  }, [getFormValues, values]);

  useEffect(() => {
    getFormErrors(errors);
  }, [getFormErrors, errors]);

  return (
    <Form>
      <div className="link-section__heading">
        <h2>{heading}</h2>
        <fieldset className="fieldset">
          <legend>Your link</legend>
          <small>
            This is the link to your mini site that you can use to share all of
            your links.
          </small>
          <div className="input-wrapper">
            <TextInput
              className="indent-text-for-domain edit"
              noLabel
              name="link"
              type="text"
            />
            <span className="edit_link smaller">{baseUrl}/</span>
          </div>
        </fieldset>
      </div>
      <fieldset className="fieldset">
        <legend>Theme</legend>
        <div className="input-wrapper">
          <ColorInput
            labelAdditionalClassName="label-horizontal"
            label="Pick a color"
            name="personalDetails.backgroundColor"
            type="color"
          />
        </div>
      </fieldset>
      <fieldset className="fieldset">
        <legend>Personal Details</legend>

        <ImageFileInput
          name="personalDetails.profileImage"
          touched={touched.personalDetails?.profileImage}
          error={errors.personalDetails?.profileImage}
          path={path}
          value={values.personalDetails.profileImage}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
        />

        <div className="input-wrapper">
          <TextInput
            label="Name"
            name="personalDetails.name"
            type="text"
            placeholder=""
          />
        </div>
        <div className="input-wrapper">
          <TextInput
            label="Title"
            name="personalDetails.title"
            type="text"
            placeholder=""
          />
        </div>
      </fieldset>
      <fieldset className="fieldset">
        <FieldArray
          name="socials.socials"
          render={({ remove, push }) => {
            const disableAddMoreBtn =
              values.socials.socials[
                values.socials.socials.length - 1
              ].name.trim() === "" ||
              values.socials.socials[
                values.socials.socials.length - 1
              ].link.trim() === "";

            const onAddMoreBtnClick = () => {
              if (disableAddMoreBtn) {
                setFieldTouched(
                  `socials.socials[${values.socials.socials.length - 1}].name`,
                  true
                );
                setFieldTouched(
                  `socials.socials[${values.socials.socials.length - 1}].link`,
                  true
                );

                return;
              }
              push({ name: "", link: "" });
            };

            return (
              <>
                <div className="flex flex-ai-c flex-jc-sb mb-2">
                  <legend className="no-margin">Links</legend>
                  <Button
                    className="btn--primary add-btn width-auto"
                    spanClassName="h-24"
                    type="button"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#fff"
                          d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                        ></path>
                      </svg>
                    }
                    onClick={onAddMoreBtnClick}
                  />
                </div>
                {values.socials.socials.map((social, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: "0" }}
                    className="flex"
                  >
                    <div className="input-wrapper">
                      <TextInput
                        label="Name"
                        name={`socials.socials[${index}].name`}
                        type="text"
                        placeholder=""
                      />
                    </div>
                    <div className="input-wrapper ml-2">
                      <TextInput
                        label="Link"
                        name={`socials.socials[${index}].link`}
                        type="text"
                        placeholder=""
                      />
                    </div>
                    <div className="ml-2">
                      <Button
                        className="btn--secondary width-auto"
                        spanClassName="h-24"
                        type="button"
                        disabled={values.socials.socials.length <= 1}
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#111827"
                              d="M15 2H9c-1.103 0-2 .897-2 2v1H3v2h2v13c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V7h2V5h-4V4c0-1.103-.897-2-2-2zM9 4h6v1H9V4zm8 16H7V7h10v13z"
                            ></path>
                            <path
                              fill="#111827"
                              d="M9 9h2v9H9V9zM13 9h2v9h-2V9z"
                            ></path>
                          </svg>
                        }
                        onClick={() => remove(index)}
                      />
                    </div>
                  </div>
                ))}
              </>
            );
          }}
        />
        <CheckboxInput
          label="Show favicon"
          name="socials.showFavicon"
          type="checkbox"
        />
      </fieldset>
      <fieldset className="fieldset">
        <div className="flex flex-ai-c flex-jc-sb mb-2">
          <legend className="no-margin">Contact Form</legend>
          <CheckboxInput
            noLabel
            toggler
            name="contactForm.toggle"
            type="checkbox"
          />
        </div>
        {values.contactForm.toggle && (
          <>
            <div className="input-wrapper">
              <TextInput
                label="Email Address"
                name="contactForm.apiEmailAddress"
                type="text"
                placeholder=""
                disabled={!values.contactForm.toggle}
              />
            </div>
            <div className="input-wrapper">
              <TextInput
                label="API Key"
                name="contactForm.apiKey"
                type="text"
                placeholder=""
                disabled={!values.contactForm.toggle}
              />
            </div>
          </>
        )}
      </fieldset>
      <Button
        className="btn--primary"
        type="submit"
        text={isSubmitting ? "Saving Changes" : "Save Changes"}
        disabled={
          isSubmitting ||
          JSON.stringify(initialFormValues) === JSON.stringify(values)
        }
        // onClick={openAllToolTip}
      />
    </Form>
  );
};

FormikForm.defaultProps = {
  baseUrl: "",
};

FormikForm.propTypes = {
  heading: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  getFormValues: PropTypes.func.isRequired,
  getFormErrors: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  initialFormValues: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  baseUrl: PropTypes.string,
};

const LinkFrom = ({
  heading,
  getFormValues,
  baseUrl,
  getFormErrors,
  initialFormValues,
}) => {
  const [serverError, setServerError] = useState("");
  const [feedback, setFeedback] = useState("");

  const router = useRouter();

  const sendData = async (apiUrl, method, formData) => {
    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data || "Something went wrong";
    }

    return data;
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    //* form submit

    setServerError("");
    setFeedback("");
    if (router.pathname === "/create") {
      try {
        const response = await sendData(
          "/api/user/create-link",
          "POST",
          values
        );

        setFeedback(response.message);
        setSubmitting(false);
        router.replace("/");
      } catch (error) {
        if (error.message === "Form error") {
          setErrors({ ...error.formErrors });
          setSubmitting(false);

          return;
        }

        setSubmitting(false);
        setServerError(error.message);
      }
    } else if (router.pathname === "/edit") {
      try {
        const response = await sendData("/api/user/edit-link", "PATCH", values);

        setFeedback(response.message);
        setSubmitting(false);
        router.replace("/");
      } catch (error) {
        if (error.message === "Form error") {
          setErrors({ ...error.formErrors });
          setSubmitting(false);

          return;
        }

        setSubmitting(false);
        setServerError(error.message);
      }
    }
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        setFieldValue,
        setFieldTouched,
        setFieldError,
        errors,
        isSubmitting,
        values,
        touched,
      }) => {
        return (
          <>
            {serverError && <p className="error">{serverError}</p>}
            {feedback && <p className="feedback">{feedback}</p>}
            <FormikForm
              values={values}
              heading={heading}
              setFieldValue={setFieldValue}
              initialFormValues={initialFormValues}
              setFieldTouched={setFieldTouched}
              errors={errors}
              path={router.pathname}
              baseUrl={baseUrl}
              touched={touched}
              isSubmitting={isSubmitting}
              getFormValues={getFormValues}
              getFormErrors={getFormErrors}
            />
          </>
        );
      }}
    </Formik>
  );
};

LinkFrom.defaultProps = {
  baseUrl: "",
};

LinkFrom.propTypes = {
  heading: PropTypes.string.isRequired,
  baseUrl: PropTypes.string,
  getFormValues: PropTypes.func.isRequired,
  getFormErrors: PropTypes.func.isRequired,
  initialFormValues: PropTypes.object.isRequired,
};

export default LinkFrom;
