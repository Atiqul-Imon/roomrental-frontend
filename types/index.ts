export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord' | 'staff' | 'admin' | 'super_admin';
  profileImage?: string;
  bio?: string;
  phone?: string;
  adminMetadata?: {
    createdBy?: {
      _id: string;
      name: string;
      email: string;
    };
    lastLogin?: string;
    isActive: boolean;
    permissions?: string[];
    notes?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  verification?: {
    emailVerified: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin extends User {
  role: 'staff' | 'admin' | 'super_admin';
  adminMetadata: {
    createdBy?: {
      _id: string;
      name: string;
      email: string;
    };
    lastLogin?: string;
    isActive: boolean;
    permissions: string[];
    notes?: string;
  };
}

export interface Review {
  _id: string;
  reviewerId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  revieweeId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  listingId?: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  _id: string;
  landlordId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    state: string;
    zip?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  amenities: string[];
  availabilityDate: string;
  status: 'active' | 'pending' | 'rented';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

