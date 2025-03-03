import React from "react";
import { useLocation } from "react-router-dom";

const TawkToScript = () => {
  const location = useLocation();

  React.useEffect(() => {
    // Only load the script when the pathname is "/"
    if (location.pathname === "/") {
      // Check if the script already exists to avoid duplicates
      if (
        !document.querySelector(
          'script[src="https://embed.tawk.to/67a49eac3a842732607a81f8/1ijdgnldu"]'
        )
      ) {
        var Tawk_API = Tawk_API || {},
          Tawk_LoadStart = new Date();
        (function () {
          var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = "https://embed.tawk.to/67a49eac3a842732607a81f8/1ijdgnldu";
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");
          s0.parentNode.insertBefore(s1, s0);
        })();
      }
    }
  }, [location.pathname]);

  // Render nothing if not on the home page
  if (location.pathname !== "/") {
    return null;
  }
  return null;
};

export default TawkToScript;
