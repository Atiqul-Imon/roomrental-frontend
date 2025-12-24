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
    role?: string; // To determine if admin/staff created the listing
  };
  title: string;
  description: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
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
  status: 'active' | 'pending' | 'rented' | 'available' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  listingId?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  participant1: {
    id: string;
    name: string;
    profileImage?: string;
    email: string;
  };
  participant2: {
    id: string;
    name: string;
    profileImage?: string;
    email: string;
  };
  listing?: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
  messages?: Message[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: string[];
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

