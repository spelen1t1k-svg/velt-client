# Origins, borrowings and rights

This document exists so it is clear what in the project is original, what came from
others, and on what basis. It is written honestly, including the awkward parts.

---

## The Kirka.io client family tree

The whole ecosystem grew from one root:

| Project | Author | Role |
|---|---|---|
| **Juice Client** | irrvlo | The first client; everything else descends from it |
| **Dawn Client** | zVipexx | Built on Juice's ideas, large feature set |
| **Red Line Client** | robertpakalns | A different branch, focused on clean architecture |
| **Kirka Community Hub** | the community | A catalogue of themes, skins and sounds |

VELT is not a fork of any of them. It is a separate codebase, written from scratch.
But the feature ideas and the knowledge of which parts of the game to hook into came
from studying Dawn Client and Red Line Client, and that should be said out loud.

---

## What exactly was taken

### Taken: facts about the game, not code

To work with Kirka.io at all, you need to know how it is put together. This is not
anyone's creative work — it is a property of the game itself:

- CSS selectors for interface elements (`.kill-death`, `.desktop-game-interface`, `.hitmark`);
- asset file names and their hashes (`__hit__.200043fa.mp3`, `__texture__.b3fc7981__.webp`);
- the `localStorage` keys the game uses to store player rendering settings;
- the numeric matrix signatures that distinguish the weapon model from the arms in WebGL;
- the game's subdomains and API endpoints.

That information was obtained by taking Dawn Client apart. It could also be worked
out independently by studying the game — but the honest statement is that Dawn was
the starting point.

### Taken: feature ideas

The feature list was modelled on Dawn Client: weapon model modification, the inspect
animation, sound and texture swapping, custom skins, HUD toggles, a custom crosshair,
the kill icon.

An idea by itself is not copyrightable, but courtesy calls for naming the source.

### Not taken: the implementation

All the code was written from scratch. More than that — Dawn's implementation was
studied as **an example of what not to do**; `research/LAG_ANALYSIS.md` covers why in
detail. The key divergences:

| | Dawn | VELT |
|---|---|---|
| Frame loops | 3, one permanent and empty | 1 shared, stops with no subscribers |
| MutationObserver | 30, three of them on `body` / `document` | 1, on `#app`, no `subtree` |
| Subscription teardown | one section only | everything, structurally |
| Matrix signatures per frame | strings built with `toFixed()` | one integer, zero allocations |
| GPU queries per frame | `gl.getParameter()` every frame | none |
| `ipcRenderer.sendSync` | 17 | 0 |
| Synchronous I/O in main | 67 calls | 1 at startup |

### Separately: there was one copied block, and it has been rewritten

In an early version of VELT, the CSS for the pinned tab list was close to Dawn's
code. This was caught while preparing for publication and **rewritten completely**
in the project's own monochrome styling.

The reason is not only courtesy: the `LICENSE` file in the Dawn Client repository
contains **GPL-3.0**, even though its `package.json` declares ISC. Under copyleft,
copying would have obliged VELT to become GPL-3.0 as well. Writing our own was
simpler and more honest.

---

## VELT's licence

**MIT** — see `LICENSE`. The code is our own, so no restrictions carry over from
anything borrowed.

## Dependencies

| Package | Licence | What for |
|---|---|---|
| [Electron](https://github.com/electron/electron) | MIT | The application foundation |
| [electron-builder](https://github.com/electron-userland/electron-builder) | MIT | Building the installers |
| [esbuild](https://github.com/evanw/esbuild) | MIT | Bundling |
| [electron-updater](https://github.com/electron-userland/electron-builder) | MIT | Auto-update |

Discord Rich Presence was written from scratch on top of `node:net` — the
`discord-rpc` package is not used.

---

## User scripts

Scripts a user drops into their own folder do not automatically belong to them.
Popular examples in the community:

- **Custom Skin Link** — SheriffCarry;
- **Gun scale modifier** — imnotkoolkid, zVipexx;
- **esc menu bypass** — imnotkoolkid.

VELT does **not** distribute these and does not ship them. It only knows how to run
files the user brought themselves. Rights to such scripts stay with their authors.

---

## The relationship with Kirka.io

This part needs to be accurate rather than reassuring.

**VELT is not connected to, endorsed by, or affiliated with the developers of
Kirka.io.** Kirka.io and its assets belong to the game's rights holders.

What the client does: opens `https://kirka.io` in an Electron window and adds its
own interface on top. Game assets are not distributed with the client — swapping
only works with files the user supplies.

What the client does **not** do: it grants no gameplay advantage, does not read or
modify match network traffic, does not automate gameplay, and does not bypass paid
features. There is no aimbot, no wallhack, nothing of that kind, and none is planned.

**What cannot be promised.** Kirka.io's terms of use may prohibit third-party clients
and interface modification. The rights holder is entitled to demand the project be
taken down, or to ban accounts that use it. This is not pessimism — it is the normal
situation for any unofficial client.

The practical conclusions:

- use it at your own risk; nobody is liable if your account is banned;
- if the rights holder asks for the project to be taken down, taking it down is
  wiser than arguing;
- do not present the client as official, and do not use the Kirka brand in a name,
  logo or domain.

---

## If you are the author of one of the projects mentioned

If you believe the borrowing goes beyond what is described here, or you want the
attribution worded differently, open an issue. Disputed passages will be rewritten
or removed without negotiation.
