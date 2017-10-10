import {readFileSync} from 'fs';

const readStatsFile = (file) => {
  return JSON.parse(readFileSync(file));
};

export default readStatsFile;
