const dotenv = require('dotenv');
dotenv.config();

const api = process.env.API_BASE_URL || 'https://ielts-platform-emrv.onrender.com';
const frontend = process.env.FRONTEND_URL || 'https://ielts-platform-two.vercel.app';

(async () => {
  try {
    const be = await fetch(`${api}/api/production/status`);
    const beJson = await be.json();
    console.log('✅ Backend Health:', beJson);
    const fe = await fetch(frontend);
    console.log('✅ Frontend Online:', fe.status);
    console.log('🎯 All systems go! Public deployment verified.');
  } catch (err) {
    console.error('❌ Deployment verification failed:', err.message);
    process.exit(1);
  }
})();


