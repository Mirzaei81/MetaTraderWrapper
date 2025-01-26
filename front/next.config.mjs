/** @type {import('next').NextConfig} */
const nextConfig = {

    reactStrictMode: true,

    compiler: {
        styledComponents: true,
    },

    eslint: {
        ignoreDuringBuilds: true,
    },
    output: "standalone",
};

export default nextConfig;
