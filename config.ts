// Disclaimer: Do not store your app key and secret in your app in production. Use a server to generate tokens instead.
// These are used to generate JWTs.
// THIS IS NOT A SAFE OPERATION TO DO IN YOUR APP IN PRODUCTION.
// JWTs should be provided by a backend server as they require a secret
// WHICH IS NOT SAFE TO STORE ON DEVICE!

export const ZOOM_APP_KEY = "";
export const ZOOM_APP_SECRET = "";

export const config = {
  sessionName: "TestOne",
  roleType: "1",
  sessionPassword: "",
  displayName: "test",
  sessionIdleTimeoutMins: 10,
};