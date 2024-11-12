import displayGithub from './components/apps/github';
import displayVsCode from './components/apps/vscode';
import { displayTerminal } from './components/apps/terminal';
import { displaySettings } from './components/apps/settings';
import { displayChrome } from './components/apps/chrome';
import { displayAboutGroup8 } from './components/apps/group8';
import { displayTerminalCalc } from './components/apps/calc';
import Trash from './components/apps/trash'; // 修改了这里的导入语句

const apps = [
    {
        id: "about-group8",
        title: "About Us (Double-Click!)",
        icon: './themes/Yaru/system/folder2.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayAboutGroup8,
    },
    {
        id: "github",
        title: "Github",
        icon: './themes/Yaru/apps/github.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: false,
        screen: displayGithub,
    },
    {
        id: "chrome",
        title: "Google Chrome",
        icon: './themes/Yaru/apps/chrome.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayChrome,
    },
    {
        id: "calc",
        title: "Feedback!",
        icon: './themes/Yaru/apps/upload.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: displayTerminalCalc,
    },
    {
        id: "vscode",
        title: "Visual Studio Code (wode_scratchs)",
        icon: './themes/Yaru/apps/vscode.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayVsCode,
    },
    {
        id: "terminal",
        title: "HKU.way2way",
        icon: './themes/Yaru/apps/HK_pink.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayTerminal,
    },
    {
        id: "settings",
        title: "Settings",
        icon: './themes/Yaru/apps/gnome-control-center.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displaySettings,
    },
    {
        id: "trash",
        title: "Trash",
        icon: './themes/Yaru/system/user-trash-full.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: false,
        screen: () => <Trash />, // 修改了这里的screen参数
    },
]

export default apps;