/**
 * Environment Variables
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

/**
 * Validate Port Number
 */
export const getPort = (): number => {
  const port = parseInt(process.env.PORT || "5000", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT number");
  }
  return port;
};
