# Monobank Invoice API for Courses

Simple Vercel serverless function to create Monobank invoices
for three course plans: base, ground, pro.

## Endpoint

POST /api/invoice

Body (JSON):

{
  "plan": "base" | "ground" | "pro"
}

Response:

{
  "invoiceId": "...",
  "pageUrl": "https://pay.mbnk.biz/..."
}

## Env

MONO_TOKEN = your_monobank_merchant_token
