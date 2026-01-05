"use client";

import { useEffect, useRef , Suspense} from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AuthRedirect  () {
    return <Suspense fallback={null}>
        <AuthRedirectClient />
    </Suspense>

}

function AuthRedirectClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const allowedPaths = [
      "/reset-password-confirm",
      "/verify-email",
    ];

    if (!allowedPaths.includes(pathname)) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    const query = searchParams.toString();
    const deepLink = `zeniahub://${pathname}${query ? `?${query}` : ""}`;

    window.location.href = deepLink;

    const fallbackTimeout = setTimeout(() => {
        console.log("App not installed, staying on web");
    }, 1600);

    return () => {
      clearTimeout(openAppTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [pathname, searchParams]);

  return null;
}
