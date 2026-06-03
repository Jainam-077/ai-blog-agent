# 🚀 AI Blog Writing Agent

An AI-powered multi-agent blog generation platform that creates high-quality, SEO-optimized blog articles in minutes. The system leverages multiple specialized AI agents working together to research, structure, write, and refine content automatically.

## ✨ Features

### 🤖 Multi-Agent Blog Generation

Generate complete blog posts using a collaborative AI workflow:

* **Research Agent** – Collects and analyzes relevant information.
* **Outline Agent** – Creates a structured blog outline.
* **Writer Agent** – Produces engaging, high-quality content.
* **Editor Agent** – Refines content for clarity, grammar, and readability.

### 📚 Blog History Management

* View previously generated blogs
* Access and manage saved content
* Track blog generation history

### 🔍 SEO-Optimized Content

* Search engine-friendly article structure
* Keyword-focused content generation
* Optimized headings and formatting

### 📄 Export Functionality

* Export blogs as **PDF**
* Export blogs as **DOCX**
* Easy sharing and publishing

### 🔐 User Authentication

* Secure user registration and login
* Protected user dashboard
* Personalized content management

### ⚙️ Settings & Help Center

* User preference management
* Application settings
* Built-in support and guidance

### 📱 Modern Responsive UI

* Clean and intuitive interface
* Mobile-friendly design
* Fast and seamless user experience

---

## 🏗️ Architecture

```text
Research Agent
       ↓
Outline Agent
       ↓
Writer Agent
       ↓
Editor Agent
       ↓
    Final Blog
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* Python
* OpenAI API

---

## 📂 Project Structure

```text
AI-Blog-Agent/
│
├── frontend/          # Next.js Frontend
├── backend/           # FastAPI Backend
├── docs/              # Documentation
├── exports/           # Generated PDF/DOCX files
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Python 3.10+
* OpenAI API Key

---

## ⚙️ Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```

---

## 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key
```

---

## 📸 Screenshots

<img width="1920" height="931" alt="Screenshot (23)" src="https://github.com/user-attachments/assets/956e067f-1fcc-465d-9f6e-85818a5bc964" />


---

## 🌟 Future Enhancements

* Multi-language blog generation
* WordPress publishing integration
* AI image generation
* Content plagiarism detection
* Team collaboration features
* Blog scheduling and automation

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Jainam Prajapati**

AI/ML Engineer | Full Stack Developer | Generative AI Enthusiast

If you found this project useful, consider giving it a ⭐ on GitHub.
