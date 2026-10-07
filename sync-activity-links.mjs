import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Change image URLs only when their content changes, so GitHub requests fresh images.
let readme = await readFile('README.md', 'utf8');
await mkdir('activity-snapshots', { recursive: true });
for (const provider of ['github', 'codeforces', 'leetcode', 'monkeytype']) {
  try {
    const light = await readFile(`activity-${provider}-light.svg`);
    const dark = await readFile(`activity-${provider}-dark.svg`);
    const version = createHash('sha256').update(light).update(dark).digest('hex').slice(0, 12);
    for (const [theme, contents] of [['light', light], ['dark', dark]]) {
      await writeFile(`activity-snapshots/${provider}-${theme}-${version}.svg`, contents);
    }
    const pattern = new RegExp(`(?:activity-${provider}-(light|dark)\\.svg(?:\\?v=[a-f0-9]+)?|activity-snapshots/${provider}-(light|dark)-[a-f0-9]+\\.svg)`, 'g');
    readme = readme.replace(pattern, (_, originalTheme, snapshotTheme) => `activity-snapshots/${provider}-${originalTheme || snapshotTheme}-${version}.svg`);
    // Cached README pages can still reference previous immutable image URLs.
    // Keep published snapshots available instead of deleting them immediately.
    console.log(`${provider} image links synchronized`);
  } catch (error) {
    console.error(`${provider}: preserving previous image links (${error.code || error.message})`);
  }
}
await writeFile('README.md', readme);
