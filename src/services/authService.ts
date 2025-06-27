// Temporary mock auth service until Supabase is connected
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const signIn = async (email: string, password: string) => {
  // Mock successful sign in
  return {
    user: {
      id: '1',
      email: email
    }
  };
};

export const signUp = async (email: string, password: string) => {
  // Mock successful sign up
  return {
    user: {
      id: '1',
      email: email
    }
  };
};

export const signOut = async () => {
  // Mock sign out
  return;
};

export const getCurrentUser = async () => {
  // Mock no current user
  return null;
};