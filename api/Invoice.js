// api/invoice.js

const MONO_URL = "https://api.monobank.ua/api/merchant/invoice/create";

// ⚠️ Суми зараз прикладом (у "копійках").
// Ти можеш поміняти їх під реальні гривневі еквіваленти своїх $299 / $499 / $799.
const COURSES = {
  base: {
    amount: 29900, // 299.00 грн
    reference: "course-base-299",
    destination: "Оплата курсу База",
  },
  ground: {
    amount: 49900, // 499.00 грн
    reference: "course-ground-499",
    destination: "Оплата курсу Грунт",
  },
  pro: {
    amount: 79900, // 799.00 грн
    reference: "course-pro-799",
    destination: "Оплата курсу Pro",
  },
};

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.json({ error: "method_not_allowed" });
    }

    const { plan } = req.body || {};

    if (!plan || !COURSES[plan]) {
      res.statusCode = 400;
      return res.json({ error: "unknown_course" });
    }

    const course = COURSES[plan];

    const body = {
      amount: course.amount,
      ccy: 980, // гривня
      merchantPaymInfo: {
        reference: course.reference,
        destination: course.destination,
      },
      // поміняй URL-и на свої реальні сторінки
      successUrl: "https://your-website.com/payment-success",
      failUrl: "https://your-website.com/payment-fail",
      redirectUrl: "https://your-website.com/payment-result",
      // webHookUrl можеш додати пізніше, якщо треба
      // webHookUrl: "https://your-backend.com/api/mono-webhook",
    };

    const response = await fetch(MONO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN, // 🔐 токен з ENV, не в коді
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Monobank error:", response.status, text);
      res.statusCode = 500;
      return res.json({
        error: "monobank_error",
        message: text,
      });
    }

    const data = await response.json();

    res.statusCode = 200;
    return res.json({
      invoiceId: data.invoiceId,
      pageUrl: data.pageUrl,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.statusCode = 500;
    return res.json({ error: "server_error" });
  }
};
