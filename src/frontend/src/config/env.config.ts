/**
 * Environment configuration with type safety and validation
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
const validateEnv = () => {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(
    (key) => !(key in import.meta.env)
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Run validation in development
if (env.isDevelopment) {
  validateEnv();
}