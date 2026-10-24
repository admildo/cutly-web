import * as migration_20261024_110248_initial_cms_schema from './20261024_110248_initial_cms_schema';
import * as migration_20261024_112409_add_media_storage from './20261024_112409_add_media_storage';

export const migrations = [
  {
    up: migration_20261024_110248_initial_cms_schema.up,
    down: migration_20261024_110248_initial_cms_schema.down,
    name: '20261024_110248_initial_cms_schema',
  },
  {
    up: migration_20261024_112409_add_media_storage.up,
    down: migration_20261024_112409_add_media_storage.down,
    name: '20261024_112409_add_media_storage'
  },
];
