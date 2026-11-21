// Coffee Passport settings.
//
// Both values are safe to publish: the web app URL does nothing without a
// Google sign-in from an approved email, and the client ID is public by design.
// Leave them empty to run the app in demo mode (sample data, saved only on
// this device).
window.CP_CONFIG = {
  // The Apps Script web app URL, from Deploy > Manage deployments in the sheet.
  BACKEND_URL: 'https://script.google.com/macros/s/AKfycbyT0Qrubh3SNO9R4n_1JqWcQ0XhJMKIw3MQjblTlw-Z-GFrOxQn4oONJm3nHab02qv5/exec',
  // The OAuth client ID from Google Cloud > APIs & Services > Credentials.
  GOOGLE_CLIENT_ID: '733862051742-pa8kr7sp6ktbnoms6mcmjpt4ttdvdj16.apps.googleusercontent.com'
};
