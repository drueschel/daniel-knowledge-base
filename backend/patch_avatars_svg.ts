import fs from 'fs';
import path from 'path';

const dbFile = path.join(__dirname, 'data/employees.json');
const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const nameMap: Record<string, string> = {
  'ingest': 'prometheus',
  'mia': 'athena',
  'research': 'mnemosyne',
  'script': 'calliope',
  'voice': 'orpheus',
  'visuals': 'iris',
  'qa': 'themis',
  'dist': 'hermes',
  'analytics': 'kairos'
};

const updatedData = dbData.map((emp: any) => {
  if (nameMap[emp.id]) {
    emp.avatar = `/avatars/${nameMap[emp.id]}.svg`;
  }
  return emp;
});

fs.writeFileSync(dbFile, JSON.stringify(updatedData, null, 2));
