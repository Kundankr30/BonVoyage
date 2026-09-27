# BonVoyage Tech Stack

This document outlines the complete technology stack used to build the BonVoyage application and the rationale behind each choice.

## 🎨 Frontend Stack (User Interface)

*   **React (via Vite):** 
    *   **Why:** React is the industry standard for building highly interactive single-page applications (SPAs). Vite was chosen over Webpack or Create-React-App because of its incredibly fast hot-module-replacement (HMR) and lightning-fast build times.
*   **TypeScript:** 
    *   **Why:** Provides static typing over standard JavaScript. This drastically reduces runtime errors by catching bugs during development (e.g., ensuring a `Vessel` object has the correct properties) and provides superior autocomplete in the IDE.
*   **Tailwind CSS:** 
    *   **Why:** A utility-first CSS framework that allows for rapid UI prototyping and styling directly within the TSX files. It eliminates the need for managing bloated CSS stylesheets and ensures a consistent design system.
*   **shadcn/ui (Radix UI):** 
    *   **Why:** Provides unstyled, accessible UI primitives (like dropdowns, modals, and tables). Instead of locking you into a rigid component library like Material-UI, shadcn allows complete styling control via Tailwind while handling the complex accessibility logic under the hood.
*   **React Leaflet:** 
    *   **Why:** A React wrapper for Leaflet.js. Used for the Live Map feature to render vessels, ports, and trade routes. It is lightweight, supports custom tilesets (like the ESRI Satellite view), and handles geo-coordinates effortlessly.
*   **Recharts:** 
    *   **Why:** A composable charting library built on React components. It is used to render the Freight Forecasts and Dashboard analytics, offering great out-of-the-box animations and responsive design.

---

## ⚙️ Backend Stack (Core API Service)

*   **Node.js with Express:** 
    *   **Why:** A lightweight, highly proven web framework for building the main REST API. It handles CRUD operations (like creating enquiries or fetching ports) quickly and scales well for I/O bound tasks.
*   **Prisma ORM:** 
    *   **Why:** A next-generation Object-Relational Mapper. Prisma reads your database schema and generates a fully type-safe query builder. This means your backend code knows exactly what columns exist in the database, preventing SQL syntax errors and injection attacks.
*   **PostgreSQL:** 
    *   **Why:** An advanced, open-source relational database. Maritime data is highly relational (Shipments belong to Ports, Vessels have capacities, etc.), and Postgres provides the robust ACID compliance and complex querying capabilities required for this data.
*   **Bun:** 
    *   **Why:** Used as the JavaScript runtime and package manager. Bun is significantly faster than Node/npm for installing dependencies and running TypeScript files directly (eliminating the need to manually compile TS to JS before running).

---

## 🧠 ML Engine (Microservice)

*   **Python:** 
    *   **Why:** The undisputed king of Data Science and Machine Learning. The ecosystem for data manipulation and model training is unmatched.
*   **FastAPI:** 
    *   **Why:** A modern, incredibly fast Python web framework. We separated the ML engine into its own microservice so that heavy numerical calculations wouldn't block the Node.js API. FastAPI serves the predictions asynchronously.
*   **XGBoost:** 
    *   **Why:** eXtreme Gradient Boosting. This is the core algorithm used for the Freight Rate predictions. XGBoost is famous for its performance and accuracy on tabular data (like ship specs, route distances, and historical rates) compared to standard neural networks or random forests.
*   **Pandas & Scikit-Learn:** 
    *   **Why:** Used for preprocessing the incoming API requests (scaling inputs, encoding categorical variables like 'Vessel Type') so they match the format the XGBoost model was originally trained on.
*   **Joblib:** 
    *   **Why:** Used to load the pre-trained `xgb_freight_model.pkl` and `scaler.pkl` files into memory when the FastAPI server starts.
