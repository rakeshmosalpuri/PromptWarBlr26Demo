# 🌪️ RESQ | Universal Disaster Response Engine

**RESQ** is a production-grade, intelligence-driven platform designed to resolve unstructured, messy real-world data into actionable crisis logistics. Leveraging **Multimodal AI**, **Real-time Geo-spatial dashboards**, and **Secure Authority Control**, it empowers dispatchers to respond to complex emergencies with precision.

---

### 🎯 Problem Statement Alignment

**The Challenge:**
> *"Build a Gemini-powered App that acts as a universal bridge between human intent and complex systems... taking unstructured, messy, real-world inputs and converting them into structured, verified, and life-saving actions."*

**Our Solution:**
1.  **The Universal Bridge:** Our **Multimodal Nexus Intake** accepts photos, voice, medical logs, and distress text, acting as the entry point for human chaos.
2.  **Human Intent to System-Logic:** Using **Gemini 2.5 Flash**, RESQ isolates the core intent from messy inputs (e.g., extracting urgent surgical needs from a block of medical history) and maps it to a rigid **JSON Tactical Schema**.
3.  **Life-Saving Actions:** These structured facts are instantly routed to a **Google Maps Tactical Bridge**, where they are converted into verified rescue missions, evac routes, and medical alerts.

---

### 🧠 Core Intelligence System
*   **Multimodal AI (Gemini 2.5 Flash):** The engine doesn't just read text; it "sees." It ingests citizen distress signals, medical history documents, technical log dumps, and real-time photos of structural damage to perform automated triage.
*   **Global Translation Engine:** Integrated **Google Cloud Translation API** auto-detects 100+ languages and translates them into English as a pre-processor for the AI engine, ensuring universal support.
*   **Tactical Modes:** Specialized context profiles for **Distress**, **Medical**, **Technical/Logs**, and **Traffic**, allowing the AI to prioritize different types of logistics.

---

### 🗺️ Live Operations & Sync
*   **Google Maps Hub:** A real-time tactical dashboard with dark-themed tactical styling, dynamic domain-colored markers, and severity scaling.
*   **Real-time Synchronization:** Built on **Cloud Firestore**, every incident ingest is immediately synchronized to every active operator console using reactive listeners.
*   **Secure Command Gate:** Integrated **Google SSO via Firebase Auth**, restricting access to authorized operations personnel.

---

### 🏗️ Project Architecture & Structure

```text
Societal/
├── src/
│   ├── components/
│   │   ├── citizen/         # Multimodal Nexus intake portal
│   │   ├── operator/        # Tactical dashboard, Maps, and Incident management
│   │   └── shared/          # Error boundaries, Toast alerts, Auth gates, and Config banners
│   ├── services/
│   │   ├── config.js        # Centralized .env detector and missing-key logic
│   │   ├── geminiService.js # AI engine (multimodal vision + text)
│   │   ├── translateService.js # Multilingual pre-processor
│   │   ├── mapsService.js   # Google Maps JS API lazy loader
│   │   └── firebase.js      # Auth, Firestore, and Real-time sync logic
│   ├── tests/               # 21+ Vitest/RTL unit & component tests
│   └── App.jsx              # Global Error & Toast management
├── .env.example             # Template for required Google Cloud / Firebase keys
└── vite.config.js           # Configuration for Vite + Vitest
```

---

### 🚀 Rapid Setup (Getting Started)

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/rakeshmosalpuri/PromptWarBlr26Demo.git
    cd Societal
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory (based on `.env.example`).
    - **Gemini API:** [Get key from AI Studio](https://aistudio.google.com/apikey)
    - **Google Maps:** [Enable Maps JS API](https://console.cloud.google.com/apis)
    - **Cloud Translation:** [Enable Translation API](https://console.cloud.google.com/apis)
    - **Firebase:** [Create a project & Web App config](https://console.firebase.google.com)

3.  **Run Development Bridge:**
    ```bash
    npm run dev
    ```
    The app's **Config Banner** will show you exactly which keys are missing or active.

---

### 🛠️ Production Resilience
*   **Self-Healing:** If an API key is missing, the system gracefully degrades to "Simulation Mode" without crashing.
*   **Error Boundaries:** Critical runtime exceptions are caught with a Material-3 styled intervention screen.
*   **Toast System:** Real-time feedback for API quota exceeded (429), Network failure, or Firestore sync-up.
*   **Accessibility:** WCAG 2.1 AA compliant—semantic HTML5, ARIA-enabled interactions, and keyboard skip-links.

---

### 🧪 Validation
```bash
# Run the 21-test automated suite
npm test
```
The testing suite validates input sanitization, multimodal data shape compliance, and intent parsing accuracy.

---

**Built by RESQ Labs.**  
*Transforming messy data into mission-critical action.*
