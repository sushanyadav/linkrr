import { Formik, Form, FieldArray } from "formik";
import PropTypes from "prop-types";

import ImageFileInput from "components/Form/ProfileImageFileInput";
import TextInput from "components/Form/TextInput";
import ColorInput from "components/Form/ColorInput";
import FileInput from "components/Form/IconImageFileInput";
import CheckboxInput from "components/Form/CheckboxInput";

import { validateLinkForm } from "utils/validate";

const FormikForm = ({
  heading,
  setFieldValue,
  setFieldTouched,
  touched,
  errors,
  isSubmitting,
  values,
  getFormValues,
}) => {
  getFormValues(values);

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
                  <div className="input-wrapper ml-1">
                    <FileInput
                      label="Icon"
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      touched={
                        touched.socials?.socials
                          ? touched.socials.socials[index]?.icon
                          : null
                      }
                      error={
                        errors.socials?.socials
                          ? errors.socials.socials[index]?.icon
                          : null
                      }
                      name={`socials.socials[${index}].icon`}
                    />
                  </div>
                  <div className="input-wrapper ml-2">
                    <ColorInput
                      label="Color"
                      name={`socials.socials[${index}].color`}
                      type="color"
                    />
                  </div>

                  <div className="flex ml-1 flex-ai-c flex-jc-e input-wrapper">
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
      <button type="submit" disabled={isSubmitting} className="primary">
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
};

const LinkFrom = ({ heading, link, getFormValues }) => {
  const initialFormValues = {
    link: link,
    personalDetails: {
      profileImage: null,
      name: "",
      title: "",
      backgroundColor: "#18493E",
    },
    socials: {
      socials: [{ name: "", link: "", color: "#000000", icon: null }],
      showFavicon: true,
    },
    contactForm: { toggle: false, apiEmailAddress: "", apiKey: "" },
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // const { name } = values;
    //* form submit
    setTimeout(() => {
      setSubmitting(false);
    }, 400);
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validate={validateLinkForm}
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
          <FormikForm
            values={values}
            heading={heading}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            errors={errors}
            touched={touched}
            isSubmitting={isSubmitting}
            getFormValues={getFormValues}
          />
        );
      }}
    </Formik>
  );
};

LinkFrom.defaultProps = {};

LinkFrom.propTypes = {
  heading: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  getFormValues: PropTypes.func.isRequired,
};

export default LinkFrom;
