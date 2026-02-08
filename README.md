# 🧬 Particle Life

**Emergent behavior simulation where simple rules create complex, life-like patterns.**

Watch thousands of particles interact based on attraction and repulsion rules. Organic structures emerge — cells forming, swarms moving, ecosystems evolving — all from basic physics.


## ✨ Demo

**[Live Demo →](https://dprrwt.github.io/particle-life)**

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `R` | Reset particles |
| `N` | Generate new rules |
| `H` | Hide / Show UI |
| `M` | Open rule matrix |
| `Click` | Spawn particles |

## 🔬 How It Works

Each particle type (color) has attraction/repulsion values toward every other type, forming an interaction matrix:

- **Positive values** → Attraction (particles move toward each other)
- **Negative values** → Repulsion (particles flee from each other)
- **Zero** → No interaction

Simple rules, but when applied to thousands of particles, complex emergent behaviors appear:

- **Cells** — Same colors cluster together, forming membrane-like boundaries
- **Swarms** — Leader-follower dynamics create flocking behavior
- **Predator-Prey** — Cyclic chasing patterns (A chases B, B chases C, C chases A)
- **Symbiosis** — Paired species that orbit each other
- **Chains** — Linked structures that flow through space

## 🎨 Features

- **6 Particle Types** — Red, Green, Blue, Yellow, Purple, Cyan
- **1000-3000 Particles** — Smooth 60 FPS performance
- **Presets** — Quick access to interesting rule sets
- **Rule Matrix Editor** — Fine-tune interactions manually
- **Visual Effects** — Trails, glow, configurable rendering
- **Wrap/Bounce** — Toggle edge behavior
- **Click to Spawn** — Add particles anywhere

## 🛠️ Technical

- Pure vanilla JavaScript
- Canvas 2D rendering
- Spatial hashing for O(n) collision detection
- Zero dependencies
- ~600 lines of code

## 📖 Inspiration

Based on "Particle Life" / "Primordial Soup" simulations, originally explored by Jeffrey Ventrella and popularized by various creative coders. The core insight: emergent complexity doesn't require complex rules — just the right simple ones.

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/dprrwt/particle-life.git
cd particle-life

# Open in browser (any server works)
npx serve .
# or
python -m http.server 8000
# or just open index.html
```

## 📝 License

MIT — Use freely, credit appreciated.

---

**Part of [dprrwt.me](https://dprrwt.me) portfolio**
