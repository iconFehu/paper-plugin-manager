import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;
import { readdirSync, statSync } from 'node:fs';
import { getUUID } from 'ant-design-vue/es/vc-dialog/util';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1600,
    height: 1000,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });
  let downloadWindow: BrowserWindow | null = null;
  let pluginList = [
    'chunky.81534',
    'minimotd-server-list-motd-plugin-with-rgb-gradients.81254',
    'skinsrestorer.2124',
    'vault.34315',
    'coreprotect.8631',
    'treeassist.67436',
    'auctionhouse.61836',
    'placeholderapi.6245',
    'cmilib.87610',
    'noteblockmusicplayer.37295',
    'plugmanx.88135',
    'worldeditsui-visualize-your-selection.60726',
  ];
  let pluginIndex = 0;
  const progress = {};
  const downloadPluginList = (event, channel, data) => {
    console.log(join(__dirname, '../preload/downloadPlugin.js'))
    if (!downloadWindow) {
      downloadWindow = new BrowserWindow({
        title: 'Download Plugin',
        icon: join(process.env.PUBLIC, 'favicon.ico'),
        webPreferences: {
          partition: getUUID().toString(),
          preload: join(__dirname, '../preload/index.js'),
          // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
          // Consider using contextBridge.exposeInMainWorld
          // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
          nodeIntegration: true,
          contextIsolation: false,
        },
        show: true,
      });
      downloadWindow.webContents.session.on('will-download', (event, item, webContents) => {
        if (pluginIndex + 1 < pluginList.length) {
          pluginIndex += 1;
          const plugin = pluginList[pluginIndex];
          console.log('plugin', plugin);
          if (plugin) {
            downloadWindow.loadURL(`https://www.spigotmc.org/resources/${plugin}`);
          } else {
            // downloadWindow.close();
          }
        }
        console.log('item.getURL()', item.getURL());
        item.setSavePath(join(data.path, item.getFilename()));
        item.on('updated', (event, state) => {
          if (state === 'interrupted') {
            console.log('Download is interrupted but can be resumed');
            // item.resume()
          } else if (state === 'progressing') {
            if (item.isPaused()) {
              console.log('Download is paused');
            } else {
              progress[pluginList[pluginIndex]] =
                (item.getReceivedBytes() / item.getTotalBytes()) * 100;
              win.webContents.send('progress-status', progress);
              console.log(`Received bytes: ${item.getReceivedBytes()}`);
            }
          }
        });
        item.once('done', (event, state) => {
          if (state === 'completed') {
            console.log('Download successfully');
          } else {
            console.log(`Download failed: ${state}`);
            downloadWindow.reload();
          }
        });
      });
    }
    if (!data.url) {
      const url = `https://www.spigotmc.org/resources/${pluginList[pluginIndex]}`;
      console.log('url', url);
      downloadWindow.loadURL(url);
    }
  };

  win.webContents.on('ipc-message', (event, channel, data: Record<string, any>) => {
    console.log('ipc-message');
    console.log('ipc-channel', channel);
    if (channel == 'download-plugin') {
      pluginIndex = 0;
      pluginList = data.pluginList;
      downloadPluginList(event, channel, data);
    }
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('dom-ready', () => {
    win.webContents.send(
      'plugin-list',
      readdirSync('D:\\PaperMC\\plugins', null).filter((item) =>
        statSync(`D:\\PaperMC\\plugins\\${item}`).isFile(),
      ),
    );
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
