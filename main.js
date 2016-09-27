const {app, BrowserWindow} = require('electron')

//
// Handle installation and then just quit.
//

if(require('electron-squirrel-startup')) return;

//
// Check for updates.
//

var isDevelopment = process.env.NODE_ENV === 'development';

// Don't use auto-updater if we are in development.
if (!isDevelopment) {
    if (os.platform() === 'darwin') {
        updateFeed = 'http://ea-todo.herokuapp.com/updates/latest';
    }
    else if (os.platform() === 'win32') {
        updateFeed = 'http://eatodo.s3.amazonaws.com/updates/latest/win' + (os.arch() === 'x64' ? '64' : '32');
    }

    autoUpdater.addListener("update-available", function(event) {
        logger.debug("A new update is available");
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-available');
        }
    });
    autoUpdater.addListener("update-downloaded", function(event, releaseNotes, releaseName, releaseDate, updateURL) {
        logger.debug("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-downloaded');
        }
    });
    autoUpdater.addListener("error", function(error) {
        logger.error(error);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-error');
        }
    });
    autoUpdater.addListener("checking-for-update", function(event) {
        logger.debug("Checking for update");
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'checking-for-update');
        }
    });
    autoUpdater.addListener("update-not-available", function() {
        logger.debug("Update not available");
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-not-available');
        }
    });

    const appVersion = require('./package.json').version;
    const feedURL = updateFeed + '?v=' + appVersion;
    autoUpdater.setFeedURL(feedURL);
}


const autoUpdater = require('auto-updater');
var updateFeed = 'http://ea-todo.herokuapp.com/updates/latest';
const appVersion = require('./package.json').version;
const feedURL = updateFeed + '?v=' + appVersion;
autoUpdater.setFeedURL(feedURL);
autoUpdater.checkForUpdates();

//
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600, frame: false});

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
})
