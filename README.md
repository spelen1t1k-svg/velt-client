<div align="center">

# VELT Client

**An unofficial desktop client for Kirka.io**

The feature set of the popular clients, without the microstutter.

[Install](#install) · [Two builds](#two-builds) · [Performance](#performance) · [Features](#features) · [Build it yourself](#building-from-source) · [Credits](NOTICE.md)

</div>

---

## What this is

An Electron window with the game in it and a client layer on top: weapon model
controls, a custom skin, sound and texture swapping, an FPS counter, HUD toggles.

The project started as a teardown of two existing clients — Dawn and Red Line. The
first has a rich feature set and noticeable microstutter; the second runs smoothly
but does far less. VELT was built to take the first and avoid the second.

The teardown it all grew out of lives in [`research/`](research/), including a
detailed account of what causes stutter in Kirka clients and how to avoid it.
Those documents are in Russian — they are working notes, not part of the product.

## Install

Download from [**Releases**](../../releases) and run:

| File | What it is |
|---|---|
| `VELT-Client-x.y.z-x64.exe` | Installer, full version |
| `VELT-Client-x.y.z-portable.exe` | No install, runs as-is |
| `VELT-Lite-x.y.z-x64.exe` | Installer, Lite |
| `VELT-Lite-x.y.z-portable.exe` | Lite, no install |

Windows will show a SmartScreen warning: the builds are not signed with a
certificate (those cost money). **More info → Run anyway.** If that is not
acceptable, build it yourself — instructions below.

Both versions can be installed side by side: separate install folders, separate
settings, they never touch each other.

The client menu opens with **Right Shift** or **F1**.

## Two builds

|  | **VELT Client** | **VELT Lite** |
|---|---|---|
| Theme | dark | light |
| FPS and ping counter | ✅ | ✅ |
| Custom skin (CSL) | ✅ | ✅ |
| Weapon model: size, position, rotation, colour, wireframe, inspect | ✅ | ✅ |
| Custom CSS | ✅ | ✅ |
| Custom sounds and textures | ✅ | ✅ |
| Ad blocking | ✅ | ✅ |
| Game HUD toggles | ✅ | ✅ |
| Kill icon and hitmarker | ✅ | ✅ |
| Custom crosshair | ✅ | — |
| Menu background | ✅ | — |
| User scripts | ✅ | — |
| Import from Dawn Client | ✅ | — |

**Lite** if you want the essentials and nothing else.
**Client** if you want the full set.

Both default to the **Balanced** preset. That matters more than anything else in
this README — see below.

## Performance

Every number below was measured in an actual match on a real 3D scene, not in the
lobby: the lobby canvas is 300×150 with nothing to draw, so figures from there are
meaningless.

Rig: GTX 1650, 180 Hz display, 20-second runs. CPU is the median across every
process the app owns.

### The one thing that caused the stutter

Two Chromium flags look like the same switch and get confused constantly. They are
not the same:

| Flag | What it actually does |
|---|---|
| `--disable-gpu-vsync` | Stop waiting for the display's vblank signal. The frame rate stays capped at the refresh rate. |
| `--disable-frame-rate-limit` | Remove the cap itself. Frames go as fast as the hardware allows. |

Measured:

| Configuration | FPS | CPU | p99 | Frames > 12 ms |
|---|---|---|---|---|
| Neither flag | 180 | 34% | 6.1 ms | 0 |
| `--disable-gpu-vsync` only | 180 | 31% | 5.7 ms | 1 |
| Both flags | 427 | 50% | — | stutter on mouse turns |

Dropping vsync is **free**: input latency goes down, smoothness does not move.
The second flag is what costs you. Frames above your refresh rate are never
displayed, yet they still cost CPU — and once the CPU has no headroom left, there
is nothing left over for mouse input either. That is what a "microfreeze" is.

This is exactly what separates Red Line from Dawn: Red Line drops vsync but keeps
the frame cap. Dawn chases 200–300 FPS and makes things worse.

**Balanced** — the default in both builds — drops vsync and keeps the cap.
**Max** removes the cap for people with CPU headroom who want the extra frames.

### Optional: a custom frame cap

You can hold the frame rate *below* your refresh rate under **Performance → Custom
frame cap**. Capping to 60 on a 180 Hz display measured **12% CPU instead of 34%** —
useful on a laptop, or to keep temperatures down.

It works by skipping frames, so it can only take frames away, never create them.
Set it near your refresh rate and the pacing gets rough; set it well below and it
is exact.

### About `--in-process-gpu`

This one is a real gain — it moves the GPU process inside the main one, so WebGL
commands stop crossing a process boundary:

| Configuration | FPS | p50 | p99 |
|---|---|---|---|
| Without it (2 runs) | 208 / 234 | 4.4 / 3.9 | 12.4 / 10.9 |
| With it (2 runs) | **317 / 291** | 3.2 / 3.5 | 5.3 / 9.0 |

It is nonetheless **off by default**, and that was a deliberate reversal. The mode
is no longer maintained in Chromium, and on some drivers it renders nothing at all —
a black window, with no way to reach the settings and turn it back off. It now sits
behind a toggle with the risk spelled out, and if the window does come up black the
client detects it and rolls the setting back on the next start.

`--use-angle=vulkan`, incidentally, made things **1.5× worse** (132 FPS) — a good
illustration of why these things get measured rather than picked from a description.

### Ad blocking

The second biggest win, and it is not a flag. Without blocking, the game pulls in
around fifteen ad scripts, the Google IMA SDK with a video player, and analytics —
all running on the same thread as the game. Hiding them with CSS only removes the
picture; the code keeps running. VELT blocks the requests outright: measured, **0**
ad requests get through.

### How it compares to Dawn Client

No direct FPS comparison between VELT and Dawn was run — that would not be honest
without identical conditions. These numbers are counted from the source instead,
and they are objective:

| | Dawn Client | VELT |
|---|---|---|
| Electron | **10.4.7** (Chromium 85, 2020) | **40.x** (Chromium 144) |
| `requestAnimationFrame` loops | 3, one of them permanent and empty | 1 shared, stops with no subscribers |
| `MutationObserver` instances | 30, three on `body` / `document` | 1, on `#app`, no `subtree` |
| Subscriptions torn down on navigation | one handler out of eight | all of them, structurally |
| `ipcRenderer.sendSync` (blocks the renderer) | 17 | 0 |
| Synchronous I/O in the main process | 67 calls | 1, at startup |
| `DOMSubtreeModified` (removed from Chromium) | 2 | 0 |
| Strings allocated per WebGL frame call | ~9 via `toFixed()` | 0, integer signature |
| Synchronous GPU queries per frame | `gl.getParameter()` every frame | none |

The important line is the **fourth**. In Dawn, section handlers re-run on every page
change and never remove the old subscriptions. After ten matches there are a hundred
live observers, each firing on every DOM change. The client gets worse the longer you
play, and only a restart helps. In VELT everything a script creates goes into a
disposal registry — forgetting to unsubscribe is not technically possible there.

Full analysis: [`research/LAG_ANALYSIS.md`](research/LAG_ANALYSIS.md).

### Checking it yourself

```bash
npm run debug
```

Frame-time percentiles, a long-task count and the number of live subscriptions are
printed every five seconds. The same figures are in the client menu under
**Performance**.

What to watch: **not average FPS, but p99 and jitter.** A client can report 240 FPS
and still feel bad if one frame a second takes 40 ms.

## Features

Everything is configured on the **Scripts** tab: the switch turns a feature on and
its settings appear directly underneath.

- **Weapon model** — size, offset and rotation on all three axes, colour, RGB cycle,
  wireframe, optionally applied to the arms too. Inspect animation on a key. Live
  keyboard editing mid-fight: `T`/`Y` size, `G` wireframe, `H` RGB, `Alt`+arrows
  position. Values are saved and survive rejoining a match.
- **Custom skin (CSL)** — texture by URL, or head and body colours.
- **Sounds and textures** — 25 sound slots and 11 weapon textures. Naming a file
  `__hit__.mp3` without a hash is enough: the swap survives game updates.
- **Game HUD** — hide chat, kill text or the whole HUD; pin the crosshair and tab
  list; opacity, scale, chat height.
- **Custom crosshair** — your own image, or a cross with size and colour controls.
- **Kill icon and hitmarker**, **menu background**, **custom CSS**.
- **User scripts** — ordinary Tampermonkey-style scripts run as-is.
- **Import from Dawn Client** — pulls over sounds, images and scripts in one click.

Hotkeys: `F2` screenshot, `F5` reload, `F6` rejoin match, `F11` fullscreen,
`F12` DevTools. All rebindable on the **Keybinds** tab.

## Building from source

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/spelen1t1k-svg/velt-client.git
```

```bash
npm install
```

Run without building an installer:

```bash
npm start
```

Build the installers:

```bash
npm run dist:all
```

Output lands in `release/` and `release-lite/`.

| Command | What it does |
|---|---|
| `npm start` | Full version |
| `npm run start:lite` | Lite |
| `npm run debug` | With performance diagnostics |
| `npm run dist` | Installers, full version |
| `npm run dist:lite` | Installers, Lite |
| `npm run dist:all` | Both |
| `npm run icon` | Regenerate the icon |

The client interface is in English; the code comments are in Russian.

## Troubleshooting

**Black screen on startup.** Almost always a graphics flag your driver does not
like. Launch with the emergency switch, which disables hardware acceleration
entirely:

```bash
"VELT Client.exe" --velt-safe
```

Then set the preset to **Safe** or **Balanced** under Performance and restart
normally. The client also detects a black window by itself and falls back a preset,
but the manual switch is there for when that is not enough.

**Reporting a problem.** The **About** tab has a *Copy a report* button — version,
GPU, the flags actually applied and current frame metrics. Attach that to any issue;
without it, diagnosing a black screen is guesswork.

## Credits, origins and Kirka.io

The code was written from scratch, but the feature ideas and the knowledge of the
game's internals came from studying Dawn Client and Red Line Client. The lineage,
exactly what was drawn from where, the licences and the relationship with the
Kirka.io rights holder are covered separately:

### → [**NOTICE.md**](NOTICE.md)

In short: VELT is **not affiliated with or endorsed by the developers of Kirka.io**.
It grants no gameplay advantage — no aimbot, no wallhack, no automation. But Kirka's
terms of use may prohibit third-party clients, so **use it at your own risk**: nobody
is liable if your account gets banned.

The code is released under the [MIT licence](LICENSE).

---

<div align="center">
<sub>An unofficial project. Kirka.io belongs to its rights holders.</sub>
</div>
