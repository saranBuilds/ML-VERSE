# Architecture & Design Decisions: ML Verse

This document explains the high-level architecture, design patterns, and engineering decisions implemented in the **ML Verse** platform.

---

## 1. Dual-Database Architecture
One of the core design choices of ML Verse is the separation of relational operations and document-based pipeline configuration state:

### Relational Database: MySQL
- **Location**: Database connection configurations in [mysql.py](file:///d:/New%20folder/ML-VERSE-main/backend/db/mysql.py) and setup DDL in [setup_db.sql](file:///d:/New%20folder/ML-VERSE-main/backend/db/setup_db.sql).
- **Responsibility**: Manages user authorization credentials and coordinates metadata for user workspaces.
- **Why MySQL?** 
  - Relational structure provides strong data integrity for user profiles.
  - Using a foreign key relationship with `ON DELETE CASCADE`, the `user_workspace` table guarantees that deleting a user removes their workspaces safely.
  - Enforces the system limitation of **exactly 5 workspaces** per user using clean relational row slots (`workspace_id_1` to `workspace_id_5`).

### Document Database: MongoDB
- **Location**: MongoDB connections in [mongodb.py](file:///d:/New%20folder/ML-VERSE-main/backend/db/mongodb.py) and model helper methods in [workspace_db.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/workspace/workspace_db.py).
- **Responsibility**: Persists complex pipeline state configurations, data cleaning strategies, column encoding methods, scaling rules, selected target variables, and ML category configurations.
- **Why MongoDB?**
  - Machine learning pipelines are highly dynamic. Different datasets have unique columns and varying preprocessing configurations (e.g., column-level imputation methods, different scaling estimators like `standard` vs `minmax`, or one-hot vs label encoding).
  - Storing this dynamic step-by-step pipeline state as a JSON-like document matches NoSQL document flexibility perfectly, avoiding complex relational schema migration or nested join queries.

---

## 2. Stateless Architecture & Token-Based Security
- **Authentication**: JWT tokens are generated on successful logins via [auth.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/authentication/auth.py).
- **Security Decorator**: A custom decorator `token_required` in [jwt.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/authentication/jwt.py) intercepts incoming API requests to validate the HTTP header's `Authorization` Bearer token.
- **Why?**
  - This allows the Flask backend to remain stateless, making it scale horizontally without maintaining in-memory session states.
  - For frontend calls, the client-side API helper [api.js](file:///d:/New%20folder/ML-VERSE-main/frontend/src/api.js) retrieves the token from browser local storage and attaches it to the Authorization header dynamically.

---

## 3. The Dataset Reconstruction (Pipeline Replay) Pattern
### The Challenge
As users clean data, encode columns, and scale features, storing the intermediate dataset at each step consumes significant disk space and creates synchronization overhead. Similarly, uploading massive CSVs repeatedly to cloud servers slows down performance.

### The Solution: Replay & Reconstruct
Instead of caching intermediate dataset states, ML Verse implements a **reconstruction pattern**:
1. **Raw Storage**: When a user uploads a new dataset in [home.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/home.py), it is uploaded directly to **Cloudinary** (cloud object storage) and the URI is saved in MongoDB.
2. **State Updates**: When the user performs data cleaning, encoding, or scaling, the backend does not store the modified file permanently. Instead, it records the transformation strategy/configuration in MongoDB (e.g. `{"pipeline.remove_columns": ["col1", "col2"]}`).
3. **Lazy Reconstruct**: When a user resumes/opens a workspace session, the backend calls `continue_workspace` in [workspace.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/workspace/workspace.py), which triggers `_reconstruct_df`:
   - Downloads the original dataset from Cloudinary.
   - Replays and applies all registered pipeline transformations sequentially:
     $$\text{Raw Dataset} \xrightarrow{\text{Remove Columns}} \text{Clean Missing} \xrightarrow{\text{Encode Categoricals}} \text{Scale Features} \xrightarrow{} \text{Final Ready State}$$
   - Caches the final dataframe locally under the `uploads` directory for immediate model training.

---

## 4. Separation of Concerns in ML Algorithms
To maintain maintainability and clean structure, all supported algorithms are isolated into single-purpose modules under `backend/app/Main/Algorithms/`:
- **Regression**: [regression.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/Algorithms/regression.py) includes models like Linear Regression, SVR, Decision Trees, Random Forests, and XGBoost.
- **Classification**: [classification.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/Algorithms/classification.py) exposes Logistic Regression, Naive Bayes (Gaussian, Multinomial, Bernoulli), K-Nearest Neighbors, Gradient Boosting, XGBoost, LightGBM, CatBoost, and Support Vector Classifiers.
- **Clustering**: [clustering.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/Algorithms/clustering.py) exposes K-Means, DBSCAN, Agglomerative Clustering, and Gaussian Mixtures.
- **Dimensionality Reduction**: [dimensionality_reduction.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/Algorithms/dimensionality_reduction.py) handles PCA, t-SNE, and Truncated SVD.

These modules expose uniform models/factory functions. The main blueprint router in [home.py](file:///d:/New%20folder/ML-VERSE-main/backend/app/Main/home.py) imports them dynamically, unpacks custom user hyperparameters, fits models, generates task-appropriate evaluation metrics (e.g., $R^2$/$RMSE$ for Regression, F1/Accuracy for Classification, Silhouette Score for Clustering), and exports the trained artifact as `model.pkl` using `joblib`.

---

## 5. Frontend Navigation & Sync Design
- **Single-Page Routing**: The react router [App.jsx](file:///d:/New%20folder/ML-VERSE-main/frontend/src/App.jsx) maps core auth pages. The internal state dashboard page [Home.jsx](file:///d:/New%20folder/ML-VERSE-main/frontend/src/pages/Home.jsx) dynamically renders page components (`WorkspaceDashboard`, `DataScienceProc`, `DatasetMart`, `UserSettings`) inside a main panel via a sidebar controller.
- **Wizard Stepper**: Under `MLprocess`, the wizard steps through a stepper containing:
  - Step 0: Category Choice
  - Step 1: Dataset Upload
  - Step 2: Preview
  - Step 3: Imputation / Cleaning
  - Step 4: EDA
  - Step 5: Preprocessing (Encoding/Scaling)
  - Step 6: Target & Model Selection
  - Step 7: Hyperparameters & Training
  - Step 8: App Deployment & Download
- **Resume Point Sync**: To make workspace sessions robust against browser reloads or logout events, the wizard progress is stored under `state.current_step` in MongoDB. Opening a workspace requests `/workspace/continue/<id>` which maps the string state (e.g., `encoding`) to its numeric index in [MLprocess.jsx](file:///d:/New%20folder/ML-VERSE-main/frontend/src/pages/Main/MLprocess/MLprocess.jsx), providing a seamless user experience.
