chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    // Make auto-updates from GitHub work
    chrome.webRequest.onHeadersReceived.addListener(function (details) {
      details.responseHeaders.forEach(function (header, i) {
        if (header.name === "X-Content-Type-Options") {
          details.responseHeaders.splice(i, 1);
        }
      });
      return {
        responseHeaders: details.responseHeaders
      };
    }, { urls: ["https://raw.github.com/squibobblepants/trello.burndown/master/*"] },
    ["responseHeaders", "blocking"]
    );


    if (request.method == "getLocalStorage") {
      console.log(localStorage[request.key]);
      sendResponse({data: localStorage[request.key]});
    }
    else {
      sendResponse({}); // snub them.
    }
});
