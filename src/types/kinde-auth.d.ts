import '@kinde-oss/kinde-auth-react';

declare module '@kinde-oss/kinde-auth-react' {
  export interface KindeAuth {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    getToken: () => Promise<string>;
  }

  export function useKindeAuth(): KindeAuth;
}