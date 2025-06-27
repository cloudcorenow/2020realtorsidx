import { apiService } from './apiService';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: string;
}

export interface TourRequestData {
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: string;
  createdAt: string;
}

export interface TourRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  propertyTitle?: string;
  propertyAddress?: string;
}

class ContactService {
  async submitContactForm(formData: ContactFormData): Promise<{ message: string; id: string }> {
    try {
      return await apiService.submitContactForm(formData);
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw new Error('Failed to submit contact form. Please try again.');
    }
  }

  async requestTour(tourData: TourRequestData): Promise<{ message: string; id: string }> {
    try {
      return await apiService.requestTour(tourData);
    } catch (error) {
      console.error('Tour request submission error:', error);
      throw new Error('Failed to submit tour request. Please try again.');
    }
  }

  async getContactSubmissions(): Promise<{ submissions: ContactSubmission[] }> {
    try {
      return await apiService.getContactSubmissions();
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw new Error('Failed to fetch contact submissions.');
    }
  }

  async getTourRequests(): Promise<{ requests: TourRequest[] }> {
    try {
      return await apiService.getTourRequests();
    } catch (error) {
      console.error('Error fetching tour requests:', error);
      throw new Error('Failed to fetch tour requests.');
    }
  }

  // Validate contact form data
  validateContactForm(data: Partial<ContactFormData>): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.subject?.trim()) {
      errors.push('Subject is required');
    }

    if (!data.message?.trim()) {
      errors.push('Message is required');
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number');
    }

    return errors;
  }

  // Validate tour request data
  validateTourRequest(data: Partial<TourRequestData>): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.phone?.trim()) {
      errors.push('Phone number is required');
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number');
    }

    if (!data.propertyId?.trim()) {
      errors.push('Property ID is required');
    }

    if (!data.preferredDate?.trim()) {
      errors.push('Preferred date is required');
    } else {
      const selectedDate = new Date(data.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Preferred date cannot be in the past');
      }
    }

    if (!data.preferredTime?.trim()) {
      errors.push('Preferred time is required');
    }

    return errors;
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  }

  // Generate available time slots for tour requests
  getAvailableTimeSlots(): string[] {
    return [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM'
    ];
  }
}

export const contactService = new ContactService();
export default contactService;