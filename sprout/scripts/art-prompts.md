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
