import fs from 'fs';
import path from 'path';

for (const file of process.argv.slice(2)) {
  let code = fs.readFileSync(file, 'utf8');
  const rel = path.posix.relative(path.posix.dirname(file), 'lib/apiHandler.js');

  // insert import after existing imports
  const lines = code.split('\n');
  let idx = 0;
  while (idx < lines.length && lines[idx].startsWith('import')) idx++;
  lines.splice(idx, 0, `import apiHandler from '${rel}';`);
  code = lines.join('\n');

  // replace export default line
  code = code.replace(/export default (async )?function handler\(/, '$1function handler(');

  // remove outer try/catch if present
  const outerTry = /(function handler\(req, res\) {\n)(\s*)try \{\n/;
  if (outerTry.test(code)) {
    code = code.replace(outerTry, '$1');
    code = code.replace(/\n\s*}\s*catch\s*\(err\)\s*{\n\s*console.error\(err\);\n\s*res.status\(500\).json\({ error: 'Internal Server Error' }\);\n\s*}\n/, '\n');
  }

  // append export default line
  code = code.replace(/\n}\s*$/, '\n}\n\nexport default apiHandler(handler);\n');
  fs.writeFileSync(file, code);
}
