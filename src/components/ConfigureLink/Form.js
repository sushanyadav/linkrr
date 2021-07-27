import { Formik, Form, FieldArray } from "formik";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { useState } from "react";

import ImageFileInput from "components/Form/ProfileImageFileInput";
import TextInput from "components/Form/TextInput";
import ColorInput from "components/Form/ColorInput";
import CheckboxInput from "components/Form/CheckboxInput";

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
  initialFormValues,
  path,
}) => {
  getFormValues(values);

  if (!values.contactForm.toggle) {
    values.contactForm.apiEmailAddress = "";
    values.contactForm.apiKey = "";
  }

  return (
    <Form>
      <div className="flex flex-ai-c flex-jc-sb link-section-heading">
        <h2>{heading}</h2>
        <div>
          <span>domain.com/</span>
          <TextInput noLabel name="link" type="text" placeholder="" />
        </div>
      </div>
      <fieldset>
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

        <div className="flex">
          <div className="input-wrapper">
            <TextInput
              label="Name"
              name="personalDetails.name"
              type="text"
              placeholder=""
            />
          </div>
          <div className="input-wrapper ml-2">
            <TextInput
              label="Title"
              name="personalDetails.title"
              type="text"
              placeholder=""
            />
          </div>
          <div className="input-wrapper ml-2">
            <ColorInput
              labelAdditionalClassName="label-horizontal"
              label="Background Color"
              name="personalDetails.backgroundColor"
              type="color"
            />
          </div>
        </div>
      </fieldset>
      <fieldset>
        <FieldArray
          name="socials.socials"
          render={({ remove, push }) => (
            <>
              <div className="flex flex-ai-c flex-jc-sb mb-2">
                <legend className="legend-without-margin">Social Links</legend>
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    push({ name: "", link: "", color: "#000000", icon: null })
                  }
                >
                  Add more
                </button>
              </div>
              {values.socials.socials.map((social, index) => (
                <div key={index} className="flex ">
                  <div className="input-wrapper">
                    <TextInput
                      label="Name"
                      name={`socials.socials[${index}].name`}
                      type="text"
                      placeholder=""
                    />
                  </div>
                  <div className="input-wrapper ml-1">
                    <TextInput
                      label="Link"
                      name={`socials.socials[${index}].link`}
                      type="text"
                      placeholder=""
                    />
                  </div>
                  <div className="flex ml-1 flex-ai-c flex-jc-e">
                    <button
                      className="primary"
                      type="button"
                      disabled={values.socials.socials.length <= 1}
                      onClick={() => remove(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        />
        {errors.socials && typeof errors.socials === "string" && (
          <p className="error">{errors.socials}</p>
        )}
        <CheckboxInput
          label="Show favicon"
          labelAdditionalClassName="label-horizontal"
          name="socials.showFavicon"
          type="checkbox"
        />
      </fieldset>
      <fieldset>
        <div className="flex flex-ai-c flex-jc-sb mb-2">
          <legend className="legend-without-margin">Contact Form</legend>
          <CheckboxInput noLabel name="contactForm.toggle" type="checkbox" />
        </div>
        <div style={{ width: "40%" }}>
          <TextInput
            label="Email Address"
            name="contactForm.apiEmailAddress"
            type="text"
            placeholder=""
            disabled={!values.contactForm.toggle}
          />
        </div>
        <div style={{ width: "40%" }}>
          <TextInput
            label="API Key"
            name="contactForm.apiKey"
            type="text"
            placeholder=""
            disabled={!values.contactForm.toggle}
          />
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={
          isSubmitting ||
          JSON.stringify(initialFormValues) === JSON.stringify(values)
        }
        className="primary"
      >
        Submit
      </button>
    </Form>
  );
};

FormikForm.defaultProps = {};

FormikForm.propTypes = {
  heading: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  getFormValues: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  initialFormValues: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
};

const LinkFrom = ({ heading, getFormValues, initialFormValues }) => {
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
              touched={touched}
              isSubmitting={isSubmitting}
              getFormValues={getFormValues}
            />
          </>
        );
      }}
    </Formik>
  );
};

LinkFrom.defaultProps = {};

LinkFrom.propTypes = {
  heading: PropTypes.string.isRequired,
  getFormValues: PropTypes.func.isRequired,
  initialFormValues: PropTypes.object.isRequired,
};

export default LinkFrom;
