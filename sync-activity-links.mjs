import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Change image URLs only when their content changes, so GitHub requests fresh images.
let readme = await readFile('README.md', 'utf8');
for (const provider of ['github', 'codeforces', 'leetcode', 'monkeytype']) {
  try {
    const light = await readFile(`activity-${provider}-light.svg`);
    const dark = await readFile(`activity-${provider}-dark.svg`);
    const version = createHash('sha256').update(light).update(dark).digest('hex').slice(0, 12);
    const pattern = new RegExp(`activity-${provider}-(light|dark)\\.svg(?:\\?v=[a-f0-9]+)?`, 'g');
    readme = readme.replace(pattern, (_, theme) => `activity-${provider}-${theme}.svg?v=${version}`);
    console.log(`${provider} image links synchronized`);
  } catch (error) {
    console.error(`${provider}: preserving previous image links (${error.code || error.message})`);
  }
}
await writeFile('README.md', readme);
