/**
 * Writes scripts/topic-image-prompts.json — 40 topics with hand-drawn scribble-icon prompts
 * (olive #6B6D55 on white), matching the Self-love / Nature / Ideas / Knowledge pattern.
 *
 * Topic order + labels are fixed (Be confident … Aging gracefully). Keep in sync with
 * scripts/duplicate-section-affirmation-phrases.js PHRASES if those change.
 *
 * Run: node scripts/emit-topic-image-prompts.mjs
 *      npm run emit-topic-prompts
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'topic-image-prompts.json');

/** @type {{ title: string, prompt: string }[]} */
const ENTRIES = [
  {
    title: 'Be confident',
    prompt:
      'A simple, hand-drawn vector-style icon of a sun with a small circle center and short uneven rays, representing "Be confident." The sun is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the sun disk is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Boost self-worth',
    prompt:
      'A simple, hand-drawn vector-style icon of three small ascending steps seen from the side, representing "Boost self-worth." The steps are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of each step is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Silence self-doubt',
    prompt:
      'A simple, hand-drawn vector-style icon of a smooth oval pebble, representing "Silence self-doubt." The pebble is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Control stress and anxiety',
    prompt:
      'A simple, hand-drawn vector-style icon of a ship\'s anchor, representing "Control stress and anxiety." The anchor is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the anchor stock and flukes is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Stop overthinking',
    prompt:
      'A simple, hand-drawn vector-style icon of a pause symbol—two chunky vertical bars inside a rough circle—representing "Stop overthinking." The symbol is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interiors of both bars are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Breathe relax',
    prompt:
      'A simple, hand-drawn vector-style icon of a loose open spiral, representing "Breathe relax." The spiral is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the spiral band is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Focus on mental health',
    prompt:
      'A simple, hand-drawn vector-style icon of a simple four-petal flower, representing "Focus on mental health." The petals and center are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of each petal is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Find motivation',
    prompt:
      'A simple, hand-drawn vector-style icon of a small flame or teardrop fire shape, representing "Find motivation." The flame is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the flame is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Achieve career success',
    prompt:
      'A simple, hand-drawn vector-style icon of a trophy cup with two handles, representing "Achieve career success." The trophy is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the cup is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Handling failure',
    prompt:
      'A simple, hand-drawn vector-style icon of an adhesive bandage with a small pad in the center, representing "Handling failure." The bandage is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The pad and strips are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Setting goals',
    prompt:
      'A simple, hand-drawn vector-style icon of a flag on a pole waving to one side, representing "Setting goals." The flag and pole are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the flag is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Succeed at school',
    prompt:
      'A simple, hand-drawn vector-style icon of a graduation mortarboard cap with a tassel, representing "Succeed at school." The cap is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The top square and brim are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Morning routine',
    prompt:
      'A simple, hand-drawn vector-style icon of a half sun rising above a straight horizon line, representing "Morning routine." The sun arc and rays are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the visible sun is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Establish new habits',
    prompt:
      'A simple, hand-drawn vector-style icon of a circular arrow forming an almost-complete loop, representing "Establish new habits." The arrow is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the arrow band is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Improve your mindset',
    prompt:
      'A simple, hand-drawn vector-style icon of a young seedling with two small leaves and a hint of soil, representing "Improve your mindset." The sprout is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The leaves are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Think positive',
    prompt:
      'A simple, hand-drawn vector-style icon of a plus sign centered inside a rough circle, representing "Think positive." The circle and plus are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the plus arms is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Love yourself',
    prompt:
      'A simple, hand-drawn vector-style icon of a heart shape, representing "Love yourself." The heart is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the heart is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Accept yourself',
    prompt:
      'A simple, hand-drawn vector-style icon of a slightly lopsided, imperfect circle or organic blob outline, representing "Accept yourself." The outline is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Self-care',
    prompt:
      'A simple, hand-drawn vector-style icon of a water drop, representing "Self-care." The drop is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the drop is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Heal your inner child',
    prompt:
      'A simple, hand-drawn vector-style icon of a balloon on a short wiggly string, representing "Heal your inner child." The balloon is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the balloon is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Start healing journey',
    prompt:
      'A simple, hand-drawn vector-style icon of two simple footprints in a row, representing "Start healing journey." Each footprint is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of each footprint is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Let go',
    prompt:
      'A simple, hand-drawn vector-style icon of a single feather, representing "Let go." The feather shaft and vane are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the vane is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Overcome hard times',
    prompt:
      'A simple, hand-drawn vector-style icon of a triangular mountain peak with a tiny mark at the summit, representing "Overcome hard times." The mountain is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the slope is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Elevate your relationships',
    prompt:
      'A simple, hand-drawn vector-style icon of a simple arched bridge, representing "Elevate your relationships." The bridge is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the arch opening has a few quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Strengthen relationships',
    prompt:
      'A simple, hand-drawn vector-style icon of two interlocking rings, representing "Strengthen relationships." The rings are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The overlapping bands are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Grow as a couple',
    prompt:
      'A simple, hand-drawn vector-style icon of two small sprouts leaning slightly toward each other, representing "Grow as a couple." The stems and leaves are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The leaf interiors are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Practice forgiveness',
    prompt:
      'A simple, hand-drawn vector-style icon of a small olive branch with a few leaves, representing "Practice forgiveness." The branch is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The leaves are filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Setting boundaries',
    prompt:
      'A simple, hand-drawn vector-style icon of a vertical fence post with two short crossbars, representing "Setting boundaries." The post is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the post panel is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Attract love',
    prompt:
      'A simple, hand-drawn vector-style icon of a horseshoe magnet shape, representing "Attract love." The magnet is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of each arm is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Practice faith',
    prompt:
      'A simple, hand-drawn vector-style icon of a taper candle with a small teardrop flame, representing "Practice faith." The candle and flame are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The candle body is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Connect with the Universe',
    prompt:
      'A simple, hand-drawn vector-style icon of a small planet with a thin tilted ring, representing "Connect with the Universe." The planet and ring are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the planet disk is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Spiritual growth',
    prompt:
      'A simple, hand-drawn vector-style icon of a stylized lotus with layered petals, representing "Spiritual growth." The petals are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of each petal is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Reclaim inner peace',
    prompt:
      'A simple, hand-drawn vector-style icon of a crescent moon, representing "Reclaim inner peace." The moon is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the crescent is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Be mindful',
    prompt:
      'A simple, hand-drawn vector-style icon of a target with a center dot and one surrounding ring, representing "Be mindful." The rings are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The center dot area is filled with a few quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Enjoy the moment',
    prompt:
      'A simple, hand-drawn vector-style icon of an hourglass with two bulbs and a narrow waist, representing "Enjoy the moment." The outline is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The upper and lower bulbs show visible, quick, textured scribble marks suggesting sand. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Practice gratitude',
    prompt:
      'A simple, hand-drawn vector-style icon of a gift box with a ribbon bow on top, representing "Practice gratitude." The box and bow are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The top of the box is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Discover your purpose',
    prompt:
      'A simple, hand-drawn vector-style icon of a compass needle inside a rough circle, representing "Discover your purpose." The compass and circle are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the dial is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Start a new beginning',
    prompt:
      'A simple, hand-drawn vector-style icon of a seed splitting with a tiny sprout emerging, representing "Start a new beginning." The seed is rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The seed interior is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Follow your dreams',
    prompt:
      'A simple, hand-drawn vector-style icon of a fluffy cloud with one small four-point star peeking from behind, representing "Follow your dreams." The cloud and star are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the cloud is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
  {
    title: 'Aging gracefully',
    prompt:
      'A simple, hand-drawn vector-style icon of a simple tree with a round canopy and short trunk, representing "Aging gracefully." The canopy and trunk are rendered with thick, imperfect, scribbled olive green lines (color code: approximately #6B6D55) on a solid white background. The interior of the canopy is filled with visible, quick, textured scribble marks. The overall feeling is raw, minimal, and sketch-like.',
  },
];

function slugify(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function main() {
  if (ENTRIES.length !== 40) {
    console.error(`Expected 40 topics, have ${ENTRIES.length}`);
    process.exit(1);
  }
  const entries = ENTRIES.map((e, i) => {
    const n = String(i + 1).padStart(2, '0');
    const slug = slugify(e.title);
    const id = `${n}-${slug}`;
    return {
      id,
      title: e.title,
      filename: `${id}.png`,
      prompt: e.prompt,
    };
  });
  writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log('Wrote', OUT, `(${entries.length} entries)`);
}

main();
