# Origins, Borrowing, and Rights

This document exists to make it clear what is original to the project, what was taken from others, and on what basis. It is written honestly, including the uncomfortable parts.

---

## The Lineage of Kirka.io Clients

The client ecosystem grew from a single root:

| Project                 | Author        | Role                                                       |
| ----------------------- | ------------- | ---------------------------------------------------------- |
| **Juice Client**        | irrvlo        | The first client, from which the others originated         |
| **Dawn Client**         | zVipexx       | Development of Juice's ideas, with a large set of features |
| **Red Line Client**     | robertpakalns | A separate branch, focused on clean architecture           |
| **Kirka Community Hub** | community     | Catalog of themes, skins, and sounds                       |

VELT is not a fork of any of them. It is a separate codebase written from scratch.

However, the feature ideas and knowledge of which parts of the game to interact with came from analyzing Dawn Client and Red Line Client, and this should be stated openly.

---

## What Was Taken

### Taken: Game Facts, Not Code

For a client to work with Kirka.io, it is necessary to understand how the game is structured. These are not creative works belonging to someone else, but properties of the game itself:

* CSS selectors for interface elements (`.kill-death`, `.desktop-game-interface`, `.hitmark`);
* asset file names and their hashes (`__hit__.200043fa.mp3`, `__texture__.b3fc7981__.webp`);
* `localStorage` keys used by the game to store player rendering settings;
* numerical matrix signatures used to distinguish weapon models and hands in WebGL;
* addresses of game subdomains and APIs.

This data was obtained by analyzing Dawn Client. It can also be discovered independently by studying the game itself — but it is only fair to state that Dawn was the starting point.

### Taken: Feature Ideas

The feature set was inspired by Dawn Client: weapon model modification, inspection animation, sound and texture replacement, custom skins, HUD toggles, custom crosshair, and kill icons.

An idea itself is not protected by copyright, but common courtesy requires naming the source.

### NOT Taken: Implementation

All code was written from scratch. In fact, Dawn's implementation was analyzed as an **example of what not to do** — `research/LAG_ANALYSIS.md` explains why in detail.

Key differences:

|                             | Dawn                                                | VELT                                               |
| --------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Animation loops             | 3, one permanently empty                            | 1 shared loop, stops when there are no subscribers |
| MutationObserver            | 30, 3 of them watching the entire `body`/`document` | 1, watching `#app`, without `subtree`              |
| Unsubscribing               | Only one section                                    | Everything, structurally                           |
| Matrix signatures per frame | Strings through `toFixed()`                         | Integer, zero allocations                          |
| GPU queries per frame       | `gl.getParameter()` every frame                     | None                                               |
| `ipcRenderer.sendSync`      | 17                                                  | 0                                                  |
| Synchronous I/O in main     | 67 calls                                            | 1 at startup                                       |

### Separate Note: One Copied Section Was Rewritten

In an early version of VELT, the CSS block for the pinned scoreboard was close to Dawn's code. This was discovered while preparing the project for publication and was **completely rewritten** using VELT's own layout and monochrome color palette.

The reason was not only a matter of courtesy: in the Dawn Client repository, the `LICENSE` file contains **GPL-3.0**, while `package.json` declares ISC. Copying code under the copyleft license would have required VELT to also become GPL-3.0. It was simpler and more honest to write our own implementation.

---

## VELT License

**MIT** — see `LICENSE`. The code is original, so there are no restrictions resulting from borrowed code.

## Dependencies

| Package                                                                   | License | Purpose                |
| ------------------------------------------------------------------------- | ------- | ---------------------- |
| [Electron](https://github.com/electron/electron)                          | MIT     | Application foundation |
| [electron-builder](https://github.com/electron-userland/electron-builder) | MIT     | Installer builds       |
| [esbuild](https://github.com/evanw/esbuild)                               | MIT     | Bundle building        |
| [electron-updater](https://github.com/electron-userland/electron-builder) | MIT     | Automatic updates      |

Discord Rich Presence is written from scratch on top of `node:net` — the `discord-rpc` package is not used.

---

## User Scripts

Scripts that users place in their own folder do not automatically belong to them. Examples of popular community scripts include:

* **Custom Skin Link** — SheriffCarry;
* **Gun scale modifier** — imnotkoolkid, zVipexx;
* **esc menu bypass** — imnotkoolkid.

VELT **does not distribute** these scripts and does not include them in its release — it only provides the ability to run files that the user brings themselves. The rights to such scripts remain with their respective authors.

---

## Relationship with Kirka.io

It is important to be precise here rather than reassuring.

**VELT is not affiliated with, endorsed by, or otherwise connected to the developers of Kirka.io.** Kirka.io and its assets belong to their respective copyright holders.

What the client does: it opens `https://kirka.io` in an Electron window and adds its own interface layer on top. Game assets are not distributed with the client — replacements only work with files that the user provides themselves.

What the client **does not** do: it does not provide gameplay advantages, read or modify match network traffic, automate gameplay actions, or bypass paid features. There is no aimbot, wallhack, or anything similar, and none is planned.

**What cannot be promised.** Kirka.io's Terms of Use may prohibit third-party clients and interface modifications. The copyright holder may request that the project be removed or ban accounts using it. This is not speculation about a worst-case scenario — it is a normal consideration for any unofficial client.

Practical conclusions:

* use the client at your own risk; no one is responsible for account bans;
* if the copyright holder asks for the project to be removed, it is more reasonable to comply than to argue;
* do not present the client as official and do not use the Kirka brand in the name, logo, or domain.

---

## If You Are the Author of One of the Mentioned Projects

If you believe that the borrowing goes beyond what is described here, or if you would like to change the wording regarding authorship, open an issue. Any disputed sections will be rewritten or removed without arguing over the terms.
