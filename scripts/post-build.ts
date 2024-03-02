/* eslint-disable node/no-unpublished-import */
import manifest from '../public/manifest.json';
import {writeFileSync} from 'fs';

// @ts-expect-error We want to strip the schema from the manifests
delete manifest['$schema'];

writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
