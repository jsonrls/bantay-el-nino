import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bantay El Niño: Philippine Climate & Drought Intelligence",
    short_name: "Bantay El Niño",
    description:
      "Public-service climate intelligence for Filipino citizens, LGU staff, and farmers. Track heat index, drought severity, and regional water stress.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAF9F5",
    theme_color: "#1A1814",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["weather", "utilities", "government"],
  };
}
