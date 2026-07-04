import { getDeviceId } from "./deviceId";

export function trackEvent(
  eventType: string,
  metadata?: Record<string, unknown>,
) {
  const deviceId = getDeviceId();
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, deviceId, metadata }),
  }).catch(() => {});
}

export function trackShare() {
  trackEvent("share_click");
}

export function trackPageView(page: string) {
  trackEvent("page_view", { page });
}
