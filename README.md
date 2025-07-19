# 💸 AssetAxis — Personal Finance, Reinvented

**AssetAxis** is a full-stack personal finance app designed to help you **track expenses, manage accounts, set budgets**, and **automate financial insights** using the latest in modern web tech and AI.

Built with cutting-edge tools like **Next.js 14**, **shadcn/ui**, **PostgreSQL**, **Prisma**, and powered by **Gemini AI** and **Inngest** for intelligent automation — this app is more than just a budget tracker. It's your smart financial assistant. 🔥

---

## 🚀 Features

- ✅ **Add & track transactions** (income & expenses)
- 📊 **Visual reports** using Recharts
- 🏦 **Multi-account support**
- 💡 **AI-generated monthly insights** with Gemini API
- 🔁 **Recurring transactions automation** with Inngest
- ⚠️ **Budget alerts** via email
- 🔐 **User authentication** (via Clerk or Supabase)
- 💬 **Beautiful UI** powered by shadcn/ui + Tailwind CSS
- 🌐 **Fully serverless** & scalable architecture

---

## 🛠️ Tech Stack

| Technology | Role |
|------------------|------|
| [**Next.js**](https://nextjs.org) | Full-stack React framework |
| [**shadcn/ui**](https://ui.shadcn.com) | Component library for stunning UI |
| [**Recharts**](https://recharts.org) | Data visualization for insights & charts |
| [**Prisma**](https://www.prisma.io) | ORM for PostgreSQL |
| [**Supabase**](https://supabase.com) | Auth + storage (optional) |
| [**PostgreSQL**](https://www.postgresql.org) | Primary database |
| [**Gemini API**](https://ai.google.dev/) | AI insights for monthly reports |
| [**Inngest**](https://www.inngest.com/) | Background jobs & automation |
| [**Clerk**](https://clerk.dev) | (Optional) Authentication provider |

---

## 📷 Screenshots

> _Coming soon: UI previews, dashboards, and mobile views..._

---

## ⚙️ Setup & Development

### 🧱 Prerequisites

- Node.js v18+
- PostgreSQL database
- Supabase account _(optional)_
- Clerk or custom auth _(optional)_
- Gemini API key

### 🔧 Installation

```bash
git clone https://github.com/your-username/assetaxis.git
cd assetaxis
npm install
```
## ⚙️ Environment Variables
### Create a .env file:
```env
DATABASE_URL=postgresql://your_db_url
GEMINI_API_KEY=your_google_generative_ai_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```
### 🔄 Database & Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```
### 🏃 Run Locally
```bash
npm dev
```

##🧪 Test Background Jobs
--
### Inngest UI:
```bash
npx inngest dev
```
--------------
# 🧠 How Gemini Enhances This App

### The app sends your financial data (summed and anonymized) to Google Gemini every month to generate:
-Personalized financial insights
-Advice based on spending patterns
-Friendly tips to optimize your saving behavior

### 📬 Budget Alerts
Users automatically receive email alerts when they're nearing their monthly budgets — no more surprises at month-end.

### 🤖 Automation by Inngest
#### AssetAxis uses Inngest to:
-Trigger recurring transactions
-Generate & send monthly reports
-Monitor budgets and send alerts
-Run scheduled background jobs

---

## 🛡️ License

[MIT LICENSE](https://github.com/Apratim23/AssetAxis/blob/main/LICENSE). Use it, remix it, ship it.

💙 Made with love by [Apratim Dutta](https://www.github.com/Apratim23)

Want to contribute or ask questions? Drop a ⭐️ if you like it, or open an issue.





