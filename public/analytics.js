(function (){
    console.log("Analytics script loaded");
    const script = document.currentScript;
    const websiteId = script.getAttribute("data-website-id");
    const domain= script.getAttribute("data-domain");

    console.log("Website ID:", websiteId, "Domain:", domain);

    const data = { websiteId, domain }; 

    fetch(`http://localhost:3000/api/track`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
})();