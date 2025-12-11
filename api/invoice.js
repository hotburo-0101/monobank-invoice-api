// api/invoice.js

const MONO_URL = "https://api.monobank.ua/api/merchant/invoice/create";

// Три пакети (суми зараз як приклад у копійках: 299.00 / 499.00 / 799.00 грн)
const COURSES = {
  base: {
    amount: 29900,
    reference: "course-base-299",
    destination: "Оплата курсу База",
  },
  ground: {
    amount: 49900,
    reference: "course-ground-499",
    destination: "Оплата курсу Грунт",
  },
  pro: {
    amount: 79900,
    reference: "course-pro-799",
    destination: "Оплата курсу Pro",
  },
};

export default async function handler(req, res) {
  // CORS, щоб Framer міг стукатись
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    let plan = null;

    if (typeof req.body === "string") {
      const parsed = JSON.parse(req.body || "{}");
      plan = parsed.plan;
    } else {
      plan = req.body?.plan;
    }

    const course = COURSES[plan];
    if (!course) {
      res.status(400).json({ error: "unknown_course" });
      return;
    }

    const body = {
      amount: course.amount,
      ccy: 980, // гривня
      merchantPaymInfo: {
        reference: course.reference,
        destination: course.destination,
      },
      successUrl: "https://example.com/payment-success",
      failUrl: "https://example.com/payment-fail",
      redirectUrl: "https://example.com/payment-result",
    };

    const response = await fetch(MONO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN, // токен з Vercel env
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Monobank error:", response.status, text);
      res.status(500).json({
        error: "monobank_error",
        message: text,
      });
      return;
    }

    const data = await response.json();

    res.status(200).json({
      invoiceId: data.invoiceId,
      pageUrl: data.pageUrl,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "server_error" });
  }
}
