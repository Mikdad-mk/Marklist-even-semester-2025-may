# 📊 Islamic Da'wa Academy – Exam Result Management System

A modern, secure, animated web application for managing and viewing academic exam results, built for **Islamic Da'wa Academy**. This platform allows students to view their results, while giving teachers and academic office users full control over result entry, verification, and publishing.

---

## 🚀 Live Demo

👉 [Live Website Link](https://your-live-link.com) *(Replace this with your live deployment link)*

---

## 🎯 Features

### ✅ Student Result Viewer
- View exam results by entering your **admission number**
- Displays:
  - Name, Class, Status (All Pass / Eligible for Higher Study / Failed)
  - Detailed mark table with subject-wise results
  - Total, Average, and Performance Level (Excellency, Good, etc.)
- **Print-friendly design** with a "Print Result" button

### ✅ Authentication & User Roles
- **Secure Login/Signup** system
- Roles:
  - 🧑‍🏫 `Subadmin (Teacher)`
  - 🏢 `Academic Office User (Main Admin)`
- **First user becomes Main Admin**
- **Teacher Signup Validation**:
  - Teachers are pre-registered by Admin
  - Must match Register Number during signup

### ✅ Admin Panel
- Add/edit teacher records
- Approve/reject teacher requests to manage marks
- Full control over user access and result visibility

### ✅ Teacher Panel
- Submit and manage student marks after approval
- Restricted to classes assigned by admin
- Request-based access system

### ✅ Google Sheets Integration
- Automatically sync submitted marks to Google Sheets (optional)

### ✅ Stunning UI/UX
- Clean, professional design using Tailwind CSS
- Smooth animations and transitions
- Mobile-responsive & print-optimized

---

## 🧰 Tech Stack

| Tech                | Usage                          |
|---------------------|--------------------------------|
| **Next.js**         | React framework for frontend   |
| **Tailwind CSS**    | Styling and layout             |
| **Supabase**        | Auth + Database (or Firebase)  |
| **Node.js**         | Backend logic                  |
| **Google Sheets API** | Marks sync                    |

---

## 📦 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/islamic-dawa-exam-result.git
cd islamic-dawa-exam-result

2. Install dependencies
bash
Copy
Edit
npm install
3. Set up environment variables
Create a .env.local file and add:

env
Copy
Edit
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_API_KEY=your_google_api_key
4. Run the development server
bash
Copy
Edit
npm run dev
🌐 Deployment
Deploy this project on:

Vercel (Recommended for Next.js)

Netlify

Firebase Hosting

Render

📸 Screenshots
(Add images of your login page, result viewer, admin panel, etc. Use Markdown like this:)




🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change or improve.

📄 License
This project is licensed under the MIT License.

✨ Acknowledgements
Thanks to Supabase

Thanks to Tailwind CSS

Thanks to [Islamic Da'wa Academy] for the inspiration.

Built with ❤️ for education, accessibility, and excellence.

AIzaSyB840HmCQ4PeMg_SFlmFs59E-sc4pICZfM