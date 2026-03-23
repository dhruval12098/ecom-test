import Script from "next/script";
import { redirect } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function getMaintenanceMessage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      cache: "no-store",
    });
    const result = await response.json();
    const raw = result?.data?.maintenance_enabled;
    const enabled = raw === true || raw === 1 || raw === "1" || raw === "true";
    const message =
      result?.data?.maintenance_message ||
      "We are performing scheduled maintenance. Please check back soon.";
    return { enabled, message };
  } catch {
    return {
      enabled: true,
      message:
        "We are performing scheduled maintenance. Please check back soon.",
    };
  }
}

export default async function MaintenancePage() {
  const { enabled, message } = await getMaintenanceMessage();

  if (!enabled) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <Script
        src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.js"
        strategy="afterInteractive"
      />
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-3xl font-semibold text-neutral-900">
          We’ll be right back
        </h1>
        <div className="mx-auto w-full max-w-xs">
          {/* dotlottie player web component */}
          <dotlottie-player
            src="/brands/maintenance_mode.lottie"
            background="transparent"
            speed="1"
            loop
            autoplay
            style={{ width: "100%", height: "260px" }}
          ></dotlottie-player>
        </div>
        <p className="text-neutral-600">{message}</p>
        <p className="text-sm text-neutral-500">
          Thanks for your patience.
        </p>
      </div>
    </div>
  );
}
