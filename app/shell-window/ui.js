import { ipcRenderer, remote } from 'electron'
import url from 'url'
import * as tabs from './ui/tabs'
import * as navbar from './ui/navbar'
import * as pages from './pages'
import * as commandHandlers from './command-handlers'
import * as swipeHandlers from './swipe-handlers'

const Menu = remote.Menu;

export function setup (cb) {
  if (window.process.platform == 'darwin') {
    document.body.classList.add('darwin')
  }

  // wire up event handlers
  ipcRenderer.on('window-event', onWindowEvent)
  document.addEventListener('dragover', preventDragDrop, false)
  document.addEventListener('drop', preventDragDrop, false)
  function preventDragDrop (event) {
    // important - dont allow drag/drop in the shell window, only into the webview
    if (!event.target || event.target.tagName != 'WEBVIEW') {
      event.preventDefault()
      return false
    }
  }

  const InputMenu = Menu.buildFromTemplate([{
    label: 'Undo',
    role: 'undo',
  }, {
    label: 'Redo',
    role: 'redo',
  }, {
    type: 'separator',
  }, {
    label: 'Cut',
    role: 'cut',
  }, {
    label: 'Copy',
    role: 'copy',
  }, {
    label: 'Paste',
    role: 'paste',
  }, {
    type: 'separator',
  }, {
    label: 'Select all',
    role: 'selectall',
  },
  ]);

  document.body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  e.stopPropagation();

  let node = e.target;

  while (node) {
    if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
      InputMenu.popup(remote.getCurrentWindow());
      break;
    }
    node = node.parentNode;
  }
});

  // setup subsystems
  tabs.setup()
  navbar.setup()
  commandHandlers.setup()
  swipeHandlers.setup()
  pages.setActive(pages.create(pages.DEFAULT_URL))
  cb()
}

function onWindowEvent (event, type) {
  if (type == 'blur')
    document.body.classList.add('window-blurred')
  if (type == 'focus') {
    document.body.classList.remove('window-blurred')
    try { pages.getActive().webviewEl.focus() }
    catch (e) {}
  }
  if (type == 'enter-full-screen')
    document.body.classList.add('fullscreen')
  if (type == 'leave-full-screen')
    document.body.classList.remove('fullscreen')
}
