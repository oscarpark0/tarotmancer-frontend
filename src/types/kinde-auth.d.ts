import '@kinde-oss/kinde-auth-react';

declare module '@kinde-oss/kinde-auth-react' {
  export interface KindeAuth {
    getToken: () => Promise<string>;
  }

  export function useKindeAuth(): KindeAuth;
}