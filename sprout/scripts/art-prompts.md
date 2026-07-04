# SPROUT — AI Art Generation Prompts

The app renders themed emoji/CSS placeholders by default. To swap in real
AI-generated illustrations, generate PNGs with any image model (referencing the
real Apple Park products), drop them in `public/art/<id>.png`, and register the
id in `ART_MANIFEST` in `src/lib/art.ts`.

## House style (prepend to every prompt)

> Soft, organic children's picture-book illustration in the Apple Park Kids
> style: muslin/bamboo textures, warm pastel palette (sage #A8C5A8, dusty rose
> #D4A5A5, terracotta, cream #F4EFE6), gentle hand-painted shading, cozy and
> heirloom, flat cream background, no text, centered subject.

## Buddy thumbnails (`public/art/buddy-<key>.png`)

One per selectable buddy. Reference the real plush/doll.

- `buddy-ziggy-zebra` — "Ziggy Zebra, a soft striped zebra plush toy, sitting."
- `buddy-cupcake-the-unicorn` — "Cupcake the Unicorn, pastel plush unicorn with a soft horn."
- `buddy-charlie-cheetah` — "Charlie Cheetah, spotted plush cheetah, friendly."
- `buddy-chloe` … `buddy-grady` — "Apple Park Kids soft cloth doll named <Name>, muslin dress."
  (Dolls: Chloe, Mia, Wren, Paloma, Ella, Gwen, Levi, Luke, Alex, Grady.)

## Quiz choice cards (`public/art/q<n>-<choice>.png`)

Match the forced-choice moments in `src/data/questions.ts`:

- Q1 seeds — acorn / dandelion feather-seed / large red seed / shiny golden seed
- Q2 sounds — drum / ocean waves / grand piano / flute
- Q3 windows — mountains / flower field / cozy fireplace / toy workshop
- Q4 visitors — fox / bunny / bear / monkey
- Q5 treats — compass & map / flower crown / teddy nap / tiny house build

## Backgrounds (`public/art/bg-*.png`)

- `bg-intro` — a seed in a terracotta pot on a windowsill, blue wall (Forest-style).
- `bg-record` — vintage record player, warm light.
- `bg-grow-1..4` — seed → sprout → sapling → blooming flower, same pot.

## Reveal flowers (`public/art/flower-<archetype>.png`)

- `flower-adventurer` — sunflower
- `flower-dreamer` — wild rose
- `flower-nurturer` — lavender sprig
- `flower-maker` — marigold

After adding files, add their ids to `ART_MANIFEST` in `src/lib/art.ts`.

---

# v2 — Animated Story Scene (emoji-free, code-driven)

The quiz now renders a continuous, wind-blown illustrated world (`SceneStage`) with
the chosen buddy as the main character — all inline SVG, no emoji. To upgrade the
placeholder SVG art with AI-generated illustration, produce PNGs (transparent where
noted) and register their ids in `ART_MANIFEST` in `src/lib/art.ts`.

## Doll/buddy cutouts (`public/art/buddy-<key>.png`, transparent)
Full-body character cutout, front-facing, standing, feet visible, soft top-down light.
`BuddyCharacter` uses it automatically in both the scene and the buddy picker.
- `buddy-chloe` … `buddy-grady` — the 10 Apple Park Kids dolls, each in its catalog outfit.
- `buddy-ziggy-zebra`, `buddy-cupcake-the-unicorn`, … — each named Farm Buddy plush.

## Parallax scene layers (`public/art/scene-*.png`, wide, transparent)
Match the beats in `src/data/scenes.ts` (hilltop → path → lookout → meadow → garden → bloom).
- `scene-sky` — soft gradient sky with a warm sun.
- `scene-hills-far` / `scene-hills-mid` — rolling pastel hills (parallax layers).
- `scene-ground` + `scene-grass` — foreground meadow with tall grass (for wind sway).
- `scene-flowers` — a row of flowers that open at the bloom beat.
- `scene-visitor-fox` — the little friend that appears around Q4.

## Choice icons (`public/art/choice-<name>.png`)
One per `icon` key in `src/data/questions.ts`: run, kite, cloud, pinwheel, drum, waves,
piano, flute, mountains, flowers, fireplace, workshop, fox, bunny, bear, monkey,
compass, crown, teddy, house, gift.

House style: soft organic children's-book illustration, muslin/bamboo texture, warm
pastel palette (sage #A8C5A8, dusty rose #D4A5A5, terracotta, cream #F4EFE6), gentle
hand-painted shading, no text.

> Optional motion upgrade: replace the code scene with a **Lottie** (`public/anim/growth.json`)
> or **Rive** (`public/anim/garden.riv`) file and drive it with the same `progress` value —
> `SceneStage` already centralizes progress, so only that component changes.

---

# v11 — Oil-pastel cozy night-meadow (drop-in slots)

The scene is coded (SVG + paper-grain filter). To replace it with real oil-pastel art, generate PNGs
with the prompt below and drop them in `/public/art`; wire them by swapping the coded layers in
`SceneStage.tsx` (or register in `art.ts`).

**Master style prompt** (per your brief): "An authentic, highly detailed hand-drawn oil-pastel
illustration, thick visible textured wax strokes, soft crayon-smudged blending on heavily textured
cream artisan paper. Gentle, organic, imperfect, like a cherished children's book. A cozy gentle night
in a quiet organic meadow framed by soft cloud-like trees and a calm winding stream, under a large warm
crescent moon with a sleepy comforting smile and a swirling sky of soft rounded colorful stars. Rounded
forms, no sharp edges; relaxed sleepy happy expressions; tactile texture; soft comforting moon/starlight;
muted earth tones — warm apricots, gentle blues, mossy greens, muted yellows, soft browns. No high
saturation, no alarming contrast."

Layer slots (transparent PNGs unless noted):
- `scene-bg-night.png` (full, opaque) — sky + moon + stars + distant hills.
- `scene-moon.png`, `scene-tree.png`, `scene-stream.png`, `scene-mountains.png`, `scene-cottage.png`.
- `buddy-<key>.png` — doll/animal cutouts (already supported by `BuddyCharacter`).
- `companion-bunny.png`, `companion-bear.png` — the walk-alongside friends.
- `toy-<icon>.png` — held toys (flute, drum, compass, crown, teddy, wrench).
