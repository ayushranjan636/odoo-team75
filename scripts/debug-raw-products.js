require('dotenv').config();
const Odoo = require('odoo-await');

const odoo = new Odoo({
  baseUrl: process.env.ODOO_URL || 'https://rentkar2.odoo.com',
  db: process.env.ODOO_DB || 'rentkar2',
  username: process.env.ODOO_USERNAME || 'ayushranjan535@gmail.com',
  password: process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || 'd90be76471da68d1a593859f5435fc993d2bb778'
});
(async () => {
  try {
    await odoo.connect();
    console.log('Connected. Fetching raw product.template ids...');
    const ids = await odoo.search('product.template', []);
    console.log('Total product.template records:', ids.length);
    if (!ids.length) return;
    const subset = ids.slice(0, 10);
    const records = await odoo.read('product.template', subset, ['id','name','categ_id','sale_ok','active','list_price']);
    console.log('First records:', records);
  } catch (e) {
    console.error('Error raw fetch:', e.message);
  }
})();
