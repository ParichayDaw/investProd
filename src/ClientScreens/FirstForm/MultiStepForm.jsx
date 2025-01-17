import React, { useState, useEffect } from 'react';
import { Stepper, Step } from 'react-form-stepper';
import styles from "./Page.module.css";
import PageOne from './PageOne';
import PageTwo from './PageTwo';
import PageThree from './PageThree';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Page.css";

const MultiStepForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const getCookieValue = (cookieName) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(`${cookieName}=`)) {
        const encodedValue = cookie.substring(cookieName.length + 1); // Remove `${cookieName}=`
        return decodeURIComponent(encodedValue);
      }
    }
    return null;
  };
  
  const getNameAndEmailFromCookie = () => {
    const name = getCookieValue('name');
    const email = getCookieValue('email');
    return { name, email };
  };
  
  const { name: initialName, email: initialEmail } = sessionStorage.getItem('name') 
    ? sessionStorage
    : getNameAndEmailFromCookie() || '';
  
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    age: '',
    gender: '',
    qualification: '',
    address: '',
    jobRole: '',
    agreement: false,
    photoId: null,
    profilePhoto: { data: '', contentType: '' },
    phone: '',
    question_0: '',
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',

  });

  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const [photoBase64, setPhotoBase64] = useState(null);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoBase64(base64String);

      setFormData({
        ...formData,
        photoId: {
          data: base64String.split(',')[1],
          contentType: file.type,
        },
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };


  const handleppu = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoBase64(base64String);

      setFormData({
        ...formData,

        profilePhoto
          : {
          data: base64String.split(',')[1],
          contentType: file.type,
        },
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const validatePageOne = () => {
    const errors = {};
    if (!formData.age) errors.age = 'Age is required';
    const ageValue = parseInt(formData.age.trim(), 10);
    if (ageValue < 18 || ageValue > 120) errors.age = 'Age Should be >18';
    if (isNaN(formData.age.trim())) errors.age = "invalid age"
    if (!formData.qualification) errors.qualification = 'Qualification is required';
    if (!formData.address) errors.address = 'Location is required';
    if (!formData.jobRole) errors.jobRole = 'Job Role is required';
    if (!formData.gender) errors.gender = 'Please select your gender'; // New validation
    if (formData.phone.trim() === '') errors.phone = 'Phone number is required';
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) errors.phone = 'Enter a Valid 10-Digit Phone No.';
    if (formData.photoId === null || formData === "") errors.photo = 'Photo Id is needed';
    return errors;
  };

  const validatePageTwo = () => {
    const errors = {};
    if (!formData.question_0) errors.question_0 = 'primary investment objectives required';
    if (!formData.question_1) errors.question_1 = 'Risk Tolerance required';
    if (!formData.question_2) errors.question_2 = 'investment experience required';
    if (!formData.question_3) errors.question_3 = 'annual income required';
    if (!formData.question_4) errors.question_4 = 'investment time horizon required';
    return errors;
  };

  const validatePageThree = () => {
    const errors = {};
    if (!formData.agreement) errors.agreement = 'You must agree to the terms and conditions';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.agreement) { }
    try {
      const response = await fetch(`https://team4api.azurewebsites.net/api/v1/client/register-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      console.log(formData);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed');
      }

      const data = await response.json();
      console.log('response:', data);

      navigate('/client_dashboard'); // Navigate to '/cldash' if registration is successful
      document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    } catch (error) {
      console.error('Error.', error.message);
    }
  };

  const nextStep = () => {
    let errors = {};
    switch (activeStep) {
      case 0:
        errors = validatePageOne();
        break;
      case 1:
        errors = validatePageTwo();
        break;
      case 2:
        errors = validatePageThree();
        break;
      default:
        break;
    }

    if (Object.keys(errors).length === 0) {
      setActiveStep(activeStep + 1);
      setFormErrors({});
    } else {
      alert(Object.values(errors).join('\n'));
      setFormErrors(errors);
    }
  };

  // Add a useEffect to invoke validation for page two when activeStep changes to 1
  useEffect(() => {
    if (activeStep === 1) {
      const errors = validatePageTwo();
      if (Object.keys(errors).length === 0) {
        setFormErrors({});
      } else {
        setFormErrors(errors);
      }
    }
  }, [activeStep]);

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    setFormErrors({});
  };

  const handleAgreementChange = () => {
    setFormData({ ...formData, agreement: !formData.agreement });
    setTermsAgreed(!termsAgreed);
  };

  return (
    <>
      <div className={styles['StepperContainer-0-2-1']}>
        <Stepper activeStep={activeStep}>
          <Step label="Personal Details" />
          <Step label="Questionnaire" />
          <Step label="Terms & Conditions" />
        </Stepper>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {activeStep === 0 && (
          <PageOne formData={formData} handleChange={handleFormChange} uploadPhoto={handlePhotoUpload} ppupload={handleppu} />
        )}
        {activeStep === 1 && (
          <PageTwo formData={formData} handleChange={handleFormChange} />
        )}
        {activeStep === 2 && (
          <PageThree agreed={formData.agreement} handleCheckboxChange={handleAgreementChange} />
        )}
        <div className={`${styles.btns} ${termsAgreed ? styles['terms-agreed'] : ''}`}>
          {activeStep < 2 && (
            <button type="button" className={styles['next-button']} onClick={nextStep}>Next</button>
          )}
          {activeStep > 0 && (
            <button type="button" className={styles['prev-button']} onClick={prevStep}>Back</button>
          )}
          {activeStep === 2 && formData.agreement && (
            <button className={`${styles['register-submit-btn']} ${styles['next-button']}`} type="submit">Submit</button>
          )}
        </div>
        {Object.keys(formErrors).length > 0 && (
          <div className={styles['error-message']}>
            {Object.values(formErrors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </form>
    </>
  );
};

export default MultiStepForm;
