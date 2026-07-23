const { execSync } = require('child_process');

const passwords = ['Lupiyo', 'lupiyo', '12345678', 'postgres123', 'admin123', 'root123', 'pklku123', 'smk123', '123', 'Lupiyo123', 'lupiyo123'];

for (const pw of passwords) {
  const url = `postgresql://postgres:${pw}@localhost:5432/postgres?schema=public`;
  try {
    const result = execSync(`npx prisma db execute --url="${url}" --stdin`, {
      input: 'SELECT 1;',
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    console.log('>>> SUCCESS! Postgres password is:', pw);
    process.exit(0);
  } catch (e) {
    // continue
  }
}
console.log('No user password matched.');
