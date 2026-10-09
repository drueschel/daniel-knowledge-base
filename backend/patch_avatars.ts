import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, 'data/employees.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const updated = data.map((emp: any) => {
  if (emp.id === 'ingest') emp.avatar = '/avatars/prometheus.jpg';
  if (emp.id === 'mia') emp.avatar = '/avatars/athena.jpg';
  return emp;
});

fs.writeFileSync(file, JSON.stringify(updated, null, 2));
console.log("Updated avatar paths!");
