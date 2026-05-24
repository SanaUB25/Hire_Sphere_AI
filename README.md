# 🌌 HireSphere.ai — Next-Gen AI Talent Acquisition & Verification System

HireSphere.ai is a premium, high-fidelity AI-powered talent acquisition platform designed for modern tech ecosystems. Featuring automated resume analysis, voice-based AI interview mock simulations, comparative compatibility matching, regional talent hub SVG heatmaps, and a heuristic AI fraud protection moderating system.

Developed with a professional dark cyberpunk HSL design system, fully responsive charts, animated vertical timelines, and strict role-based protected navigation guards.

---

## 🚀 Primary Architectural Highlights

- **🤖 AI Career Roadmap Generator**: Animated vertical timelines mapping technical mastery phases, certification milestones, and recommended coursework.
- **🎙️ Voice-based AI Mock Interview Rooms**: Dynamic vocal speech synthesizers paired with speech-to-text recognition API tools and a 15-bar glowing real-time soundwave visualization.
- **⚡ Heuristic AI Fraud Shield**: High-precision screening that checks extreme salary ratios and phishing patterns, warning candidates and flagging suspect listings in real-time.
- **🗺️ Regional Talent Heatmap**: Interactive global SVG thermal maps overlaying hub densities (Silicon Valley, Austin, NY) with complete mouse telemetry tooltips.
- **🛡️ Secure PostgreSQL Relational Schema**: Normalized multi-table designs (`users`, `candidates`, `employers`, `jobs`, `applications`, `saved_jobs`, `interviews`, `notifications`, `reports`) configured with strict Row Level Security (RLS) policies.

---

## 📁 Technical Core Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & TSX Client Components)
- **Styling & Motion**: Vanilla CSS HSL variables, [Framer Motion](https://www.framer.com/motion/) for glow-transforms, and [Lucide React](https://lucide.dev/) icons
- **Telemetry Charts**: [Recharts](https://recharts.org/) for area, bar, and donut funnel distribution analytics
- **Database Model**: [PostgreSQL (Supabase compatible)](https://supabase.com/) with RLS policies, indexing triggers, and views

---

## 🛠️ Step-by-Step Installation & Local Execution

### 1. Clone the Directory & Resolve Dependencies
Navigate to your active directory and install required system packages:
```bash
# Install core packages
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root workspace folder:
```env
# Next.js Port Config
PORT=3000

# NextAuth Security Key (Optional)
NEXTAUTH_SECRET=hiresphere_sandbox_jwt_secure_key
```

### 3. Initialize Local Server
Start the Turbopack hot-reload compiler locally:
```bash
# Run local client
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your local browser to access the active sandbox!

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

To deploy the normalized database layer to a production Supabase instance:

1. Copy the comprehensive schema parameters inside [schema.sql](file:///c:/Users/ubsan/.gemini/antigravity/scratch/hire-sphere-ai/schema.sql).
2. Open your active Supabase Project Dashboard and access the **SQL Editor**.
3. Paste the contents of `schema.sql` into a new query window.
4. Run the query to:
   - Construct normalized table entities.
   - Inject indexing patterns for search speed.
   - Configure audit logging triggers and employer views.
   - Enable Row Level Security (RLS) constraints.

---

## 🛡️ Active Security RLS Policies

Our PostgreSQL architecture strictly shields customer profiles from unauthorized leakages:

| Target Table | Action | Policy Description |
| :--- | :--- | :--- |
| `users` | SELECT | Candidates/Recruiters can only read their own user profiles. |
| `candidates` | SELECT | Candidates can manage their own profiles; recruiters can view all candidates for recruitment checks. |
| `employers` | SELECT | Publicly viewable company profiles. Employers can modify their own company info. |
| `jobs` | SELECT | Active jobs are publicly viewable. Employers can manage their own posts. |
| `applications`| ALL | Candidates can manage their own applications. Employers can review applications for their posted jobs. |
| `reports` | ALL | Administrative accounts can moderate reported scam postings. |

---

## 💡 Sandbox Test Account Portals

To inspect each specialized view in the sandbox:

| Portal | Test Email | Default Password | Features Available |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@hiresphere.ai` | *Any password* | Resume Analyzers, Roadmaps, Interviews, Chat, Saved Jobs |
| **Employer** | `employer@hiresphere.ai` | *Any password* | Job Poster, Applicants Pipeline, Regional Heatmaps |
| **Admin** | `admin@hiresphere.ai` | *Any password* | User Banning, Fraud Moderation Review, System Activity Logs |
