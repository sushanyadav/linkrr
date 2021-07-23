import { useState } from "react";
import { Formik, Form } from "formik";
import PropTypes from "prop-types";

import TextInput from "components/Form/TextInput";
import ImageFileInput from "components/Form/ImageFileInput";

import { validateLinkForm } from "utils/validate";

const LinkFrom = ({ heading, link }) => {
  const [fileTouched, setFileTouched] = useState(false);

  const initialFormValues = {
    file: null,
    name: "",
    title: "",
    link: link,
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // const { name } = values;
    //* form submit
    setTimeout(() => {
      setSubmitting(false);
    }, 400);
  };

  //* additional hacks
  const onSubmitButtonClick = () => {
    setFileTouched(true);
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validate={validateLinkForm}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ setFieldValue, errors, isSubmitting }) => {
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
                fileTouched={fileTouched}
                setFileTouched={setFileTouched}
                error={errors.file}
                setFieldValue={setFieldValue}
              />

              <div className="flex">
                <div className="input-wrapper">
                  <TextInput
                    label="Name"
                    name="name"
                    type="text"
                    placeholder=""
                  />
                </div>
                <div className="input-wrapper ml-2">
                  <TextInput
                    label="Title"
                    name="title"
                    type="text"
                    placeholder=""
                  />
                </div>
                {/* <div className="input-wrapper ml-2">
                  <TextInput
                    label="Color"
                    name="color"
                    type="color"
                    placeholder=""
                  />
                </div> */}
              </div>
            </fieldset>
            <button
              type="submit"
              onClick={onSubmitButtonClick}
              disabled={isSubmitting}
              className="primary"
            >
              Submit
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

LinkFrom.defaultProps = {};

LinkFrom.propTypes = {
  heading: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default LinkFrom;
