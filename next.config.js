
const isProdRemoveConsoleOption =
  process.env.NODE_ENV === 'production'
    ? {
        exclude: ['error'],
      }
    : false;

const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production' ? false : true,
  swcMinify: true,
  webpack5: true,
  compiler: {
    removeConsole: isProdRemoveConsoleOption,
  },
};

module.exports = nextConfig;
