const prices = new Map([['Starter',30000],['Growth',68000],['Business',120000],['Enterprise',210000]]);
module.exports = async function checkout(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['preview', 'production'].includes(process.env.VERCEL_ENV)) return res.status(404).end();
  if (req.method !== 'POST') return res.status(405).end();
  const origin = process.env.VERCEL_ENV === 'production' ? 'https://www.betterbusiness-ad.com' : 'https://' + process.env.VERCEL_URL;
  if (!req.headers.origin || req.headers.origin !== 'https://' + req.headers.host) return res.status(403).end();
  const data = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body)) : req.body;
  const months = Number(data?.months);
  const price = prices.get(data?.plan);
  const amount = price * months * (months >= 5 ? 90 : months >= 2 ? 95 : 100) / 100;
  if (!price || !Number.isSafeInteger(months) || months < 1 || !Number.isSafeInteger(amount)) return res.status(400).send('Invalid plan or duration.');
  if (data?.confirmed !== 'yes') return res.status(400).send('Please confirm the written agreement.');
  const locale = ({en:'en',ja:'ja',zh:'en'})[data.lang] || 'en';
  const key = process.env.KOMOJU_LIVE_SECRET_KEY;
  if (!key) return res.status(503).send('Checkout is unavailable.');
  try {
    const response = await fetch('https://komoju.com/api/v1/sessions', {
      method: 'POST',
      headers: {'Content-Type':'application/json', Authorization:'Basic ' + Buffer.from(key + ':').toString('base64')},
      body: JSON.stringify({mode:'payment', currency:'JPY', amount, payment_types:['wechatpay','alipay'],  default_locale:locale, return_url:origin + '/payment-return.html?lang=' + (data.lang === 'zh' ? 'zh' : locale), metadata:{plan:data.plan,months:String(months)}})
    });
    if (!response.ok) return res.status(502).send('KOMOJU could not open checkout. Return to the plans to try again.');
    const session = await response.json();
    const url = new URL(session.session_url);
    if (url.protocol !== 'https:' || !['komoju.com','test.komoju.com'].includes(url.hostname)) throw Error('Unexpected checkout URL');
    return res.redirect(303,url.href);
  } catch {
    return res.status(502).send('Checkout is temporarily unavailable.');
  }
};