const dotenv = require('dotenv');
dotenv.config();

async function validate() {
  const url = `${process.env.API_BASE_URL}/api/production/status`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('🌍 Production Health:', data);
}

validate();


