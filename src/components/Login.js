import { useAuth0 } from "@auth0/auth0-react";

function Login() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      authorizationParams: {
        scope: 'openid profile email offline_access',
      },
    });
  };

  return <button onClick={handleLogin}>Log In</button>;
}

export default Login;