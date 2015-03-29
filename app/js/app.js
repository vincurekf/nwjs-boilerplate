/**
 * hearth of this NWJS boilerplate.
 * here we takecare of wondow showing,
 * splashscreen, saving/recovering last window state
 **/

// define global variables
var mainwin, maingui,
    tray = null,
    minimizeToTray = false,
    saveState = true,
    safeExit = true;

var viewbox = {
  initialize: function( setTray ){
    window.onload = function() {
      maingui = require('nw.gui');
      mainwin = maingui.Window.get();

      $("#close-window-button").on('click', function() {
        //
        mainwin.close();
      });
      $("#minimize-window-button").on('click', function() {
        //
        mainwin.minimize();
      });

      mainwin.on('close', function(){
        console.log('saveState', saveState)
        if( saveState ){
          viewbox.save();
        }else{
          safeExit = true;
        };
        this.close(safeExit);
      });
      mainwin.on('minimize', function(){
        saveState = false;
        if( minimizeToTray ){
          mainwin.hide();
        }
        viewbox.showTray();
      });
      mainwin.on('restore', function(){
        //
        saveState = true;
      });
      var saving;
      mainwin.on('move', function(){
        clearTimeout(saving);
        saving = setTimeout(function(){ 
          viewbox.save();
        }, 500);
      });
      mainwin.on('resize', function(){
        clearTimeout(saving);
        saving = setTimeout(function(){ 
          viewbox.save();
        }, 500);
      });
      viewbox.get( setTray );
    }
    window.onfocus = function() { 
      console.log("focus");
      focusTitlebar(true);
    }
    window.onblur = function() { 
      console.log("blur");
      focusTitlebar(false);
    }
    var focusTitlebar = function (focus) {
      var opacity = focus ? "1" : "0.9";
      var titlebar = $("#top-titlebar");
      if (titlebar) titlebar.css('background-color', 'rgba(33,33,33,'+opacity+')' );
    }
  },
  get: function( setTray ){
    localforage.getItem('windowstate', function(err, value) {
      if (err){
        return console.log( err );
      }else{
        if ( value !== null ){
          console.log( value );
          var newWidth = value['width'];
          var newHeight = value['height'];
          var newXpos = value['xpos'];
          var newYpos = value['ypos'];
          mainwin.resizeTo(newWidth, newHeight);
          mainwin.moveTo(newXpos, newYpos);
          minimizeToTray = value['totray'];
        }
        /*
        */
        mainwin.show();
        if( setTray ){ 
          viewbox.setGuiMenu();
        }
      }
    });
  },
  save: function(){
    if ( saveState ){
      var state = {
        xpos: mainwin.x,
        ypos: mainwin.y,
        width: mainwin.width,
        height: mainwin.height,
        totray: minimizeToTray
      };
      localforage.setItem('windowstate', state, function(err, value) {
        console.log( value );
        safeExit = true;
      });
    }
  },
  showTray: function(){
    tray = tray || new maingui.Tray({         // Create a new Tray, option is an object contains initial settings for the Tray.
      icon: 'app/img/icon_16.png',     // Get or Set the icon of Tray, icon must a path to your icon file. It can be a relative path which points to an icon in your app, or an absolute path pointing to a file in user's system.
      title: 'NWJS - Title',                 // On Mac title will be showed on status bar along with its icon, but it doesn't have effects on GTK and Windows, since the latter two platforms only support tray to be showed as icons.
      tooltip: 'NWJS - Tooltip'
    });
    // Give it a menu
    var menu = new maingui.Menu();
    viewbox.menuItems( menu );
    tray.menu = menu;
    // Show window and remove tray when clicked
    tray.on('click', function() {
      mainwin.show();
    });
  },
  setGuiMenu: function(){
    var menu = new maingui.Menu({ 'type': 'menubar' });
    viewbox.menuItems( menu );
    mainwin.menu = menu;
    document.body.addEventListener('contextmenu', function(ev) { 
      ev.preventDefault();
      menu.popup(ev.x, ev.y);
      return false;
    });
  },
  menuItems: function( menu ){
    menu.append(new maingui.MenuItem({ label: 'NWJS',
      type: 'normal',
      icon: 'app/img/icon_16.png',
      click: function(){
        mainwin.show();
      }  
    }));
    menu.append(new maingui.MenuItem({ type: 'separator' }));
    menu.append(new maingui.MenuItem({ label: 'Minimize to tray', 
      type: 'checkbox', 
      checked: minimizeToTray,
      click: function(){
        console.log(this.checked);
        minimizeToTray = this.checked;
        viewbox.save();
        if( !minimizeToTray ) {
          mainwin.show();
          //tray.remove(); tray = null;
        }
      } 
    }));
    menu.append(new maingui.MenuItem({ label: 'Show window', 
      type: 'normal',
      click: function(){
        mainwin.show();
      } 
    }));
  }
}; viewbox.initialize( true );