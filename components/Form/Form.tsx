import React, { useEffect, useState } from 'react';
import { useNinetailed, useProfile } from '@ninetailed/experience.js-next';
import { Field, Form as ContactForm } from 'react-final-form';
import * as Yup from 'yup';

const defaultErrorMessage = 'Please complete this required field';
export const Form: React.FC = () => {
  const { profile } = useProfile();
  const { identify } = useNinetailed();
  const [showForm, setShowForm] = useState<boolean>(true);

  type ErrorType = {
    [key: string]: unknown;
  };

  type FormTraits = {
    [key: string]: string;
  };

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  const onSubmit = async (values: FormTraits) => {
    console.log(values);
    if (profile) {
      identify(profile.id, values)
        .then((_) => {
          return _;
        })
        .catch((e: Error) => {
          return e;
        });
    }
    setShowForm(false);
  };

  /* const validationSchema = Yup.object({
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
    companyName: Yup.string().required(),
    companySize: Yup.string().required(),
    businessEmail: Yup.string().email(),
  }); */
  /* type FormValidationSchema = Yup.InferType<typeof validationSchema>;
  const validateFormValues = (schema: FormValidationSchema) => {
    return async (values: any) => {
      /!* if (typeof schema === 'function') {
        schema = schema();
      } *!/
      try {
        await schema.validate(values, { abortEarly: false });
      } catch (err) {
        const errors = err.inner.reduce((formError, innerError) => {
          return setIn(formError, innerError.path, innerError.message);
        }, {});

        return errors;
      }
    };
  };

  const validate = validateFormValues(validationSchema);
  const validate = async (values) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (err: unknown) {
      console.log(err.inner);
      /* return err.inner.reduce(
        (formError: any, innerError: { path: any; message: any }) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            ...formError,
            [innerError.path]: innerError.message,
          };
        },
        {}
      );
    }
  }} */

  return (
    <>
      <div
        className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-12 lg:max-w-7xl"
        id="form"
      />
      <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-12 lg:max-w-7xl">
        {showForm ? (
          <ContactForm
            onSubmit={onSubmit}
            validate={(values) => {
              const errors = {} as ErrorType;
              if (!values.firstName) {
                errors.firstName = defaultErrorMessage;
              }
              if (!values.lastName) {
                errors.lastName = defaultErrorMessage;
              }
              if (!values.companyName) {
                errors.companyName = defaultErrorMessage;
              }
              if (
                !values.companySize ||
                values.companySize === 'defaultValue'
              ) {
                errors.companySize = defaultErrorMessage;
              }
              if (!values.businessEmail) {
                errors.businessEmail = defaultErrorMessage;
              }
              return errors;
            }}
            initialValues={{ companySize: 'defaultValue' }}
            render={({ handleSubmit }) => {
              return (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col space-y-4 items-start"
                >
                  <fieldset className="flex flex-row w-full justify-between">
                    <Field name="firstName">
                      {({ input, meta }) => {
                        return (
                          <div className="w-[48%] flex flex-col">
                            <label htmlFor="firstName" className="text-[14px]">
                              First Name
                              <span className="text-[#f2545b]">*</span>
                            </label>
                            <input
                              {...input}
                              type="text"
                              placeholder="First Name"
                              className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] border-[1px] rounded-[3px] border-[#cbd6e2] focus:outline-indigo-600"
                            />
                            {meta.error && meta.touched && (
                              <span className="text-[#f2545b] text-[14px]">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        );
                      }}
                    </Field>
                    <Field name="lastName">
                      {({ input, meta }) => {
                        return (
                          <div className="w-[48%] flex flex-col">
                            <label htmlFor="lastName" className="text-[14px]">
                              Last Name<span className="text-[#f2545b]">*</span>
                            </label>
                            <input
                              {...input}
                              type="text"
                              placeholder="Last Name"
                              className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                            />
                            {meta.error && meta.touched && (
                              <span className="text-[#f2545b] text-[14px]">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        );
                      }}
                    </Field>
                  </fieldset>
                  <fieldset className="flex flex-row w-full">
                    <Field name="companyName">
                      {({ input, meta }) => {
                        return (
                          <div className="w-full flex flex-col">
                            <label
                              htmlFor="companyName"
                              className="text-[14px]"
                            >
                              Company name
                              <span className="text-[#f2545b]">*</span>
                            </label>
                            <input
                              {...input}
                              type="text"
                              placeholder="Company name"
                              className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                            />
                            {meta.error && meta.touched && (
                              <span className="text-[#f2545b] text-[14px]">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        );
                      }}
                    </Field>
                  </fieldset>

                  <fieldset className="flex flex-col w-full ">
                    <label htmlFor="companySize" className="text-[14px]">
                      Company Size<span className="text-[#f2545b]">*</span>
                    </label>
                    <Field name="companySize" placeholder="Select your option">
                      {({ input, meta }) => {
                        return (
                          <>
                            <select
                              {...input}
                              className={` border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2] ${
                                input.value === 'defaultValue'
                                  ? 'text-gray-400'
                                  : ''
                              }`}
                            >
                              <option value="defaultValue" disabled>
                                Select your option
                              </option>
                              <option value="1-50">1-50</option>
                              <option value="51-200">51-200</option>
                              <option value="201-500">201-500</option>
                              <option value="501-1000">501-1000</option>
                              <option value="1001-2000">1001-2000</option>
                              <option value="more than 2000">
                                more than 2000
                              </option>
                            </select>
                            {meta.error && meta.touched && (
                              <span className="text-[#f2545b] text-[14px]">
                                {meta.error}
                              </span>
                            )}
                          </>
                        );
                      }}
                    </Field>
                  </fieldset>
                  <fieldset className="flex flex-row w-full">
                    <Field name="businessEmail">
                      {({ input, meta }) => {
                        return (
                          <div className="w-full flex flex-col">
                            <label
                              htmlFor="businessEmail"
                              className="text-[14px]"
                            >
                              Business Email
                              <span className="text-[#f2545b]">*</span>
                            </label>
                            <input
                              {...input}
                              type="text"
                              placeholder="Business Email"
                              className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                            />
                            {meta.error && meta.touched && (
                              <span className="text-[#f2545b] text-[14px]">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        );
                      }}
                    </Field>
                  </fieldset>

                  <button
                    className="bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
                    type="submit"
                  >
                    Submit
                  </button>
                </form>
              );
            }}
          />
        ) : (
          <h2>Thanks for submitting</h2>
        )}
      </div>
    </>
  );
};
