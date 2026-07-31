(function () {
  console.log("Analytics script loaded");

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString().substr(2, 9);
  }

  const session_duration = 12*60*60*1000; //12 hours in milliseconds
  const now = Date.now();
  let visitorId = localStorage.getItem("webtrack_visitor_id");
  let sessionTime = localStorage.getItem("webtrack_session_time");

  if (!visitorId || (now - sessionTime > session_duration)) {
    if(visitorId){
      localStorage.removeItem("webtrack_visitor_id");
      localStorage.removeItem("webtrack_session_time");
    }
    visitorId = generateUniqueId();
    localStorage.setItem("webtrack_visitor_id", visitorId);
    localStorage.setItem("webtrack_session_time", now);
  }
  else{
    console.log("Existing session is still valid");
  }

  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain");

  const entryTime = Math.floor(Date.now() / 1000);
  const referrer = document.referrer || "Direct";

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get("utm_source") || "";
  const utm_medium = urlParams.get("utm_medium") || "";
  const utm_campaign = urlParams.get("utm_campaign") || "";
  const refParams = window.location.href.split('?')[1] || "";

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

  fetch(`https://web-track-seven.vercel.app/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let activeStartTime = Math.floor(Date.now() / 1000);
  let totalActiveTime = 0;

  const handleExit = () => {
    const exitTime = Math.floor(Date.now() / 1000);
    totalActiveTime += Math.floor(Date.now() / 1000) - activeStartTime;

    fetch(`https://web-track-seven.vercel.app/api/track`, {
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
        exitUrl: window.location.href
      }),
    });
    //localStorage.clear();
  };
  window.addEventListener("beforeunload", handleExit);

const sendLivePing = () => {
  fetch('https://web-track-seven.vercel.app/api/live-user', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      websiteId,
      visitorId,
      last_seen: Date.now(),
      url:window.location.href
    }),
  })
}

setInterval(sendLivePing, 10000); 

})();
