let logs = [];
const isClient = !import.meta.env.SSR;
if (isClient) logs = JSON.parse(sessionStorage.getItem('logs')) || [];

export const addLog = (event, data) => {
  const logEntry = { event, data, timestamp: new Date() };
  logs.push(logEntry);

  // Check if running on the client side before accessing sessionStorage
  if (isClient) {
    sessionStorage.setItem('logs', JSON.stringify(logs));
  }
};

export const getLogs = () => {
  // Check if running on the client side before accessing sessionStorage
  if (isClient) {
    return JSON.parse(sessionStorage.getItem('logs')) || [];
  }

  return logs;
};
