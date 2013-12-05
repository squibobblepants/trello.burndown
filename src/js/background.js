chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage") {
      console.log(localStorage[request.key]);
      sendResponse({data: localStorage[request.key]});
    }
    else {
      sendResponse({}); // snub them.
    }
});