import { useState } from 'react';
import { contactService, ContactFormData, TourRequestData } from '../services/contactService';

export function useContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submitContactForm = async (formData: ContactFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate form data
      const validationErrors = contactService.validateContactForm(formData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await contactService.submitContactForm(formData);
      setSuccess('Your message has been sent successfully! We\'ll get back to you soon.');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit contact form';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestTour = async (tourData: TourRequestData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate tour request data
      const validationErrors = contactService.validateTourRequest(tourData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await contactService.requestTour(tourData);
      setSuccess('Your tour request has been submitted! We\'ll contact you soon to confirm the details.');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit tour request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    submitContactForm,
    requestTour,
    clearMessages,
    validateContactForm: contactService.validateContactForm,
    validateTourRequest: contactService.validateTourRequest,
    formatPhoneNumber: contactService.formatPhoneNumber,
    getAvailableTimeSlots: contactService.getAvailableTimeSlots,
  };
}

export default useContact;