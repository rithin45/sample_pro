export const getJWTConfig = () => {
  return {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES: "7d"
  };
};
