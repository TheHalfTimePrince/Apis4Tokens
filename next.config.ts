import type { NextConfig } from 'next';
const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [
      require("remark-prism") as import("unified").PluggableList // Adding the type here
    ],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
    serverSourceMaps: false
  },
  productionBrowserSourceMaps: false, 
};

export default withMDX(nextConfig);
