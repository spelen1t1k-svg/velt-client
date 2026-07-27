<div align="center">

# VELT Client

**Unofficial desktop client for Kirka.io**

Functionality on par with popular clients — without micro-stutters.

[Installation](#installation) · [Two Versions](#two-versions) · [Performance](#performance) · [Features](#features) · [Building](#building-from-source) · [Licensing](NOTICE.md)

</div>

---

## What It Is

An Electron window with the game and its own overlay layer: weapon settings, custom skins, sound and texture replacements, FPS counter, and interface toggles.

The project started by analyzing two existing clients — Dawn and Red Line. The former has a rich set of features but noticeable micro-stutters; the latter runs smoothly but has limited functionality. VELT was built with the goal of taking the best parts of the first without inheriting the problems of the second.

The research that everything was based on can be found in [`research/`](research/) — it also contains a detailed explanation of what exactly causes stuttering in Kirka clients and how to avoid it.

## Installation

Download from [**Releases**](../../releases) and launch:

| File                             | What it is                                 |
| -------------------------------- | ------------------------------------------ |
| `VELT Client-x.y.z-x64.exe`      | Installer for the regular version          |
| `VELT Client-x.y.z-portable.exe` | Portable version, no installation required |
| `VELT Lite-x.y.z-x64.exe`        | Lite installer                             |
| `VELT Lite-x.y.z-portable.exe`   | Portable Lite version                      |

Windows will show a SmartScreen warning: the builds are not signed with a certificate (certificates are paid). **More info → Run anyway.** If you are not comfortable with that, build the client yourself from source using the instructions below.

Both versions can be installed at the same time: they use different installation folders and separate settings, so they do not interfere with each other.

The client menu can be opened with **Right Shift** or **F1**.

## Two Versions

|                                                                      | **VELT Client** | **VELT Lite** |
| -------------------------------------------------------------------- | --------------- | ------------- |
| Theme                                                                | Dark            | Light         |
| FPS and ping counter                                                 | ✅               | ✅             |
| Custom skin (CSL)                                                    | ✅               | ✅             |
| Weapon model: size, position, rotation, color, wireframe, inspection | ✅               | ✅             |
| Custom CSS                                                           | ✅               | ✅             |
| Custom sounds and textures                                           | ✅               | ✅             |
| Ad blocking                                                          | ✅               | ✅             |
| HUD toggles                                                          | ✅               | —             |
| Custom crosshair                                                     | ✅               | —             |
| Kill icon and hitmarker                                              | ✅               | —             |
| Menu background                                                      | ✅               | —             |
| User scripts                                                         | ✅               | —             |
| Default flag preset                                                  | Balanced        | **Max**       |

**Lite** — if you want maximum FPS and nothing extra.
**Client** — if you want the full feature set.

## Performance

Tests were performed in a real 3D scene during a match, not in the lobby: in the lobby, the canvas is 300×150 and there is almost nothing to render, making any numbers from there meaningless.

Test system: GTX 1650, canvas 1064×681, 25 seconds per run.

### What Improved Performance

| Variant                           | FPS       | p50       | p99         | Jitter |
| --------------------------------- | --------- | --------- | ----------- | ------ |
| Without `in-process-gpu` (2 runs) | 208 / 234 | 4.4 / 3.9 | 12.4 / 10.9 | 2.8    |
| `--use-angle=vulkan`              | **132**   | 7.3       | 12.5        | 1.71   |
| `--in-process-gpu` (2 runs)       | 317 / 291 | 3.2 / 3.5 | 5.3 / 9.0   | 1.7    |
| **Final Lite configuration**      | **389**   | 2.5       | 4.4         | 1.76   |

Exactly one flag made the difference — `--in-process-gpu`: the GPU process is moved inside the main process, so WebGL commands no longer have to go through inter-process communication. **Vulkan made performance 1.5× worse** — a good example of why these things should be tested instead of chosen based on descriptions.

The second most important improvement is **network-level ad blocking**. Without it, the game loads around fifteen advertising scripts, the Google IMA SDK with a video player, and analytics; all of this runs on the same thread as the game. Hiding ads with CSS only removes the visual element while the code continues running. With VELT, these requests do not reach the game at all: verified — **0**.

### How It Differs from Dawn Client

A direct FPS comparison between VELT and Dawn **was not performed** — such a comparison would be inaccurate without identical testing conditions. However, the following numbers were calculated from the source code and are objective:

|                                              | Dawn Client                                             | VELT                                               |
| -------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Electron                                     | **10.4.7** (Chromium 85, 2020)                          | **40.x** (Chromium 144)                            |
| `requestAnimationFrame` loops                | 3, one permanent empty loop                             | 1 shared loop, stops when there are no subscribers |
| `MutationObserver`                           | 30, 3 of them watching the entire `body` and `document` | 1, watching `#app`, without `subtree`              |
| Unsubscribing when changing sections         | Only 1 out of 8                                         | All of them, structurally                          |
| `ipcRenderer.sendSync` (blocks the renderer) | 17                                                      | 0                                                  |
| Synchronous I/O in the main process          | 67 calls                                                | 1 at startup                                       |
| `DOMSubtreeModified` (removed from Chromium) | 2                                                       | 0                                                  |
| Strings in the WebGL frame loop              | ~9 per call through `toFixed()`                         | 0, integer signature                               |
| Synchronous GPU queries per frame            | `gl.getParameter()` every frame                         | None                                               |

The most important point here is **the third row**. In Dawn, section handlers are called again every time the page changes and old subscriptions are not removed. After ten matches, there can be more than a hundred active observers, each of them triggering on any DOM change. The client gets worse the longer you play; only restarting helps. In VELT, everything created by a script is added to a cleanup registry — forgetting to unsubscribe is technically impossible.

Detailed analysis: [`research/LAG_ANALYSIS.md`](research/LAG_ANALYSIS.md).

### How to Test It Yourself

```bash
npm run debug
```

Every five seconds, the console will display frame-time percentiles, the number of long tasks, and the number of active subscriptions. The same information is available in the client menu under the **Performance** tab.

The key metric is **not average FPS, but p99 and jitter**. A client can show 240 FPS and still stutter if one frame every second takes 40 ms.

## Features

Everything is configured in the **Scripts** tab: enabling a feature immediately displays its settings below it.

* **Weapon model** — size, offset and rotation on three axes, color, RGB cycling, wireframe, separately configurable hands. Inspection animation on a keybind. Edit values directly during a match using the keyboard: `T`/`Y` for size, `G` for wireframe, `H` for RGB, `Alt`+arrow keys for position. Values are saved and persist between matches.
* **Custom skin (CSL)** — texture from a URL, head and body colors.
* **Sounds and textures** — 25 sound slots and 11 weapon textures. Simply name a file `__hit__.mp3` without a hash: the replacement will survive game updates.
* **Game interface** — hide chat, kill feed, entire HUD; persistent crosshair and scoreboard; chat transparency, scale, and height.
* **Custom crosshair** — use your own image or a crosshair with adjustable size and color.
* **Kill icon and hitmarker**, **menu background**, **custom CSS**.
* **User scripts** — regular Tampermonkey-style scripts work as they are.
* **Dawn Client migration** — imports sounds, images, and scripts with one click.

Hotkeys: `F2` screenshot, `F5` reload, `F6` rejoin the match, `F11` fullscreen, `F12` DevTools. They can be reassigned in the **Keybinds** tab.

## Building from Source

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/spelen1t1k-svg/velt-client.git
cd velt-client
npm install
```

Run without building an installer:

```bash
npm start
```

Installers:

```bash
npm run dist:all
```

The output will be placed in `release/` and `release-lite/`.

| Command              | What it does               |
| -------------------- | -------------------------- |
| `npm start`          | Regular version            |
| `npm run start:lite` | Lite                       |
| `npm run debug`      | Performance diagnostics    |
| `npm run dist`       | Regular version installers |
| `npm run dist:lite`  | Lite installers            |
| `npm run dist:all`   | Both versions              |
| `npm run icon`       | Regenerate the icon        |

## Licensing, Origins, and Kirka.io

The project was written from scratch, but the ideas behind its features and knowledge of the game's internal structure came from analyzing Dawn Client and Red Line Client. The project's lineage, what was specifically borrowed, licenses, and its relationship with the Kirka.io copyright holders are explained separately:

### → [**NOTICE.md**](NOTICE.md)

In short: VELT **is not affiliated with or endorsed by the developers of Kirka.io**. It does not provide any gameplay advantages — no aimbot, wallhack, or automation. However, Kirka's Terms of Use may prohibit third-party clients, so **use it at your own risk**: no one is responsible for potential account bans.

The code is distributed under the [MIT](LICENSE) license.

---

<div align="center">
<sub>Unofficial project. Kirka.io belongs to its respective copyright holders.</sub>
</div>
