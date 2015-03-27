window.onfocus = function() { 
  console.log("focus");
  focusTitlebar(true);
}

window.onblur = function() { 
  console.log("blur");
  focusTitlebar(false);
}

window.onresize = function() {
  //updateContentStyle();
}

function focusTitlebar(focus) {
  var opacity = focus ? "1" : "0.9";
  var titlebar = $("#top-titlebar");
  if (titlebar) titlebar.css('background-color', 'rgba(33,33,33,'+opacity+')' );
}

window.onload = function() {
  var gui = require('nw.gui');
  var win = gui.Window.get();

  $("#close-window-button").on('click', function() {
    win.close();
  });
  $("#minimize-window-button").on('click', function() {
    win.minimize();
  });

  win.show();
}
