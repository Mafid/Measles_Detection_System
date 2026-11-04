# Frontend: Measles Detection Web Application

A single-page clinical decision-support application built with **React 19** and **Vite 8** for multimodal measles classification and explainable AI visualization.

---

## Architecture & Features

- **React 19 Hooks**: Functional components leveraging reactive state management (`useState`, `useEffect`) and programmatic routing (`useNavigate`).
- **Single Page Application Routing**: Managed by **React Router DOM v7** across dedicated diagnostic views:
  - `/`: Overview of the multimodal methodology and clinical evidence integration.
  - `/detection`: Multimodal entry interface (image upload dropzone and clinical symptom toggles).
  - `/result`: Primary diagnostic result card, modality breakdown percentages, and inline Exact SHAP symptom attribution table.
  - `/xai`: Interactive Explainable AI dashboard with diverging attribution bar charts and clinical insights.
- **Vanilla CSS Design System**: Custom responsive design system featuring dark mode styling, semantic health alerts, and glassmorphism without heavy external utility frameworks.
- **Client Session Caching**: Employs browser `sessionStorage` for transient result preservation without persistent data retention.

---

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
By default, the client communicates with the backend at `http://localhost:8000`. To point to a custom API host (e.g., in cloud deployment), copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the backend URL:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### 4. Production Build
```bash
npm run build
```
Compiled static assets will be output to the `dist/` folder, ready for deployment to Vercel, Netlify, or any static hosting service.
