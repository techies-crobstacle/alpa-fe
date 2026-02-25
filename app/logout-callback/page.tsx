"use client";

import { useEffect } from "react";

/**
 * /logout-callback
 *
 * This page is loaded inside a hidden iframe by the Dashboard when the user
 * logs out from there. It clears the Website's localStorage and then posts
 * a message back to the parent (Dashboard) so it knows the cross-domain
 * logout is complete.
 *
 * If someone navigates here directly (not in an iframe), they are simply
 * redirected to the homepage.
 */
export default function LogoutCallbackPage() {
  useEffect(() => {
    const doLogout = async () => {
      const token = localStorage.getItem("alpa_token");

      // Invalidate the token server-side so it can't be reused for SSO tickets
      if (token) {
        try {
          await fetch("https://alpa-be-1.onrender.com/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (_) {
          // Best-effort — never block the logout flow
        }
      }

      // Clear Website session data
      localStorage.removeItem("alpa_token");
      localStorage.removeItem("user");

      // Notify any in-tab listeners (e.g. CartContext)
      window.dispatchEvent(new CustomEvent("alpa-logout"));

      if (window.parent !== window) {
        // Running inside an iframe — notify the Dashboard parent that we're done
        window.parent.postMessage("alpa-logout-done", "https://alpa-dashboard.vercel.app");
      } else {
        // Navigated to directly — redirect home
        window.location.replace("/");
      }
    };

    doLogout();
  }, []);

  // Blank page — only shown for a fraction of a second inside the hidden iframe
  return null;
}
