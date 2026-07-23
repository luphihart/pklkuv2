const { execSync } = require('child_process');

const passwords = ['postgres', 'root', 'admin', '123456', 'password', '1234', '', 'master', 'pklku'];

for (const pw of passwords) {
  const url = `postgresql://postgres:${pw}@localhost:5432/postgres?schema=public`;
  try {
    console.log('Testing password:', pw);
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
console.log('No common password matched.');
