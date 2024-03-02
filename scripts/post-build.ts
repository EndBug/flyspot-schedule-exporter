/* eslint-disable node/no-unpublished-import */
import {readFileSync, writeFileSync} from 'fs';

const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf-8'));
import packageJson from '../package.json';

delete manifest['$schema'];
manifest.version = packageJson.version;

writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
