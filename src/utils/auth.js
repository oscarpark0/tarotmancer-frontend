export function getToken() {
    return localStorage.getItem('token');
  }
  
  export function getUserId() {
    return localStorage.getItem('userId');
  }
  
  export function setUserData(token, userId) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }
  
  export function clearUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }