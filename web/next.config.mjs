/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    serverExternalPackages: ['@ffmpeg-installer/ffmpeg', 'fluent-ffmpeg']
};

export default nextConfig;
