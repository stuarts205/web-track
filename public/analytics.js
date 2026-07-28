(function () {
  console.log("Analytics script loaded");

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString().substr(2, 9);
  }

  let visitorId = localStorage.getItem("webtrack_visitor_id");
  if (!visitorId) {
    visitorId = generateUniqueId();
    localStorage.setItem("webtrack_visitor_id", visitorId);
  }

  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain");

  const entryTime = Date.now();
  const referrer = document.referrer || "Direct";

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get("utm_source") || "";
  const utm_medium = urlParams.get("utm_medium") || "";
  const utm_campaign = urlParams.get("utm_campaign") || "";
  const refParams = window.location.href.split('?')[1] || "";

  console.log("Website ID:", websiteId, "Domain:", domain);

  const data = {
    type: "entry",
    websiteId,
    domain,
    entryTime,
    referrer,
    url: window.location.href,
    visitorId,
    urlParams,
    utm_source,
    utm_medium,
    utm_campaign,
    refParams,
  };

  console.log("Data to be sent:", data);

  fetch(`http://localhost:3000/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let activeStartTime = Date.now();
  let totalActiveTime = 0;

  const handleExit = () => {
    const exitTime = Date.now();
    totalActiveTime += exitTime - activeStartTime;

    fetch(`http://localhost:3000/api/track`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "exit",
        websiteId,
        domain,
        exitTime,
        totalActiveTime,
        visitorId,
      }),
    });
    localStorage.clear();
  };
  window.addEventListener("beforeunload", handleExit);
})();
