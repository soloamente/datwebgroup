/** @type {import('next').NextConfig} */
const config = {
  // Enable built-in Next.js font optimization for better performance
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sviluppo.datasystemgroup.it",
      },
      {
        protocol: "http",
        hostname: "sviluppo.datasystemgroup.it",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://sviluppo.datasystemgroup.it",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
          },
        ],
      },
    ];
  },
};

export default config;
