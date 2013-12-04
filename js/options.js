// Saves options to localStorage.
function save_options() {
  var open = document.getElementById("opencolumns");
  var closed = document.getElementById("closedcolumns");
  
  localStorage["open-columns"] = open.value;
  localStorage["closed-columns"] = closed.value;
  
  
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var open = localStorage["open-columns"];
  console.log(open);
  var closed = localStorage["closed-columns"];
  if (!open) {
    return;
  }
  var openfield = document.getElementById("opencolumns");
  openfield.value = open; 
  
  if (!closed) {
    return;
  }
  var closedfield = document.getElementById("closedcolumns");
  closedfield.value = closed;
  
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);