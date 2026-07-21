========================================================================
                      M L   V E R S E   -   R E A D M E
========================================================================

ML Verse is an end-to-end web platform that enables users to upload custom 
datasets, clean and preprocess data, perform Exploratory Data Analysis 
(EDA), train machine learning models (Regression, Classification, 
Clustering, and Dimensionality Reduction), tune hyperparameters, evaluate 
performance, make live test predictions, and download the resulting 
scikit-learn/XGBoost/LightGBM/CatBoost model artifacts.

------------------------------------------------------------------------
1. PROJECT STRUCTURE
------------------------------------------------------------------------

ML-VERSE-main/
│
├── backend/                       # Flask Backend Service
│   ├── app/
│   │   ├── authentication/        # User authentication, JWT tokens, OTP verification
│   │   ├── Main/
│   │   │   ├── Algorithms/        # Modular ML algorithms (regression, classification, clustering, dim-reduction)
│   │   │   ├── home.py            # Primary blueprint for ML pipeline operations & dataset processing
│   │   │   └── utils.py           # Helper methods for EDA, cleaning, encoding, scaling
│   │   ├── workspace/             # Workspace creation, listing, reconstruction, and deletion blueprints
│   │   ├── cloudinary_utils.py    # Remote storage integrations for datasets
│   │   └── __init__.py            # Flask App Factory and route initialization
│   │
│   ├── db/
│   │   ├── ca.pem                 # Secure SSL Certificate authority for MySQL
│   │   ├── mongodb.py             # MongoDB connection singleton setup
│   │   ├── mysql.py               # MySQL connection & SQL query helpers
│   │   └── setup_db.sql           # Schema definition DDL for MySQL Tables
│   │
│   ├── config.py                  # Server configuration, settings, environment loading
│   ├── requirements.txt           # Python backend library dependencies
│   └── run.py                     # Entrypoint script to run Flask dev server
│
├── frontend/                      # React Frontend Client (Vite)
│   ├── src/
│   │   ├── assets/                # Images, icons, CSS static assets
│   │   ├── components/            # Shared UI parts (auth cards, protected route gate)
│   │   ├── pages/
│   │   │   ├── Main/
│   │   │   │   ├── MLprocess/     # Step components for the ML workflow wizard (upload, clean, EDA, etc.)
│   │   │   │   └── Workspace/     # Dashboard and workspace creation components
│   │   │   ├── ForgotPassword.jsx # Auth view for password recovery
│   │   │   ├── Home.jsx           # Sidebar shell page that mounts child tabs
│   │   │   ├── Login.jsx          # User login screen
│   │   │   ├── Sidebar.jsx        # Sidebar navigation controller
│   │   │   └── Signup.jsx         # User registration screen
│   │   ├── api.js                 # Axios instance with Bearer interceptors
│   │   ├── App.jsx                # Main react router switchboard
│   │   └── main.jsx               # Vite bootstrap entrypoint
│   │
│   ├── eslint.config.js           # Lint configurations
│   ├── index.html                 # Main single page document
│   ├── package.json               # Node packages and running scripts
│   └── vite.config.js             # Vite building configurations
│
├── decision.md                    # Detailed system design and design decisions
└── readme.txt                     # This instruction file

------------------------------------------------------------------------
2. SYSTEM & DATA ARCHITECTURE
------------------------------------------------------------------------

* Databases Roles:
  - MySQL: Relational database that stores user profile records (usernames, 
    hashed passwords, emails) and controls workspace slot allocations. It 
    limits users to exactly 5 workspaces to manage server storage quotas.
  - MongoDB: Stored document database schema that keeps track of the active 
    step, raw dataset URI on Cloudinary, columns to drop, value imputations, 
    categorical encoders, scaling methods, and task parameters.

* Pipeline Replay (Lazy Reconstruction):
  Instead of saving large datasets at every intermediate stage (e.g., raw, 
  cleaned, encoded, scaled), the raw dataset is saved remotely in Cloudinary. 
  Pre-processing strategies are stored in MongoDB. When a user resumes a 
  workspace, the backend downloads the raw data and replays the sequence of 
  transformations programmatically to reproduce the DataFrame dynamically.

------------------------------------------------------------------------
3. FUNCTIONAL WORKFLOW (THE ML WIZARD STEPS)
------------------------------------------------------------------------

1. Category & Type Selection: Select ML target category (Supervised or 
   Unsupervised) and task type (Regression, Classification, Clustering, or 
   Dimensionality Reduction).
2. Dataset Upload: Uploads a CSV/Excel file, pushes the raw data to 
   Cloudinary, and returns column headers.
3. Dataset Preview: Displays a tabular preview of the first 50 rows of data.
4. Data Cleaning: Drop unnecessary columns and specify numerical or 
   categorical missing values imputation strategies (mean, median, mode, or 
   constant drop).
5. EDA: Runs statistics summaries (`describe()`) for numerical and 
   categorical columns, displaying counts, unique items, distributions, etc.
6. Feature Engineering: Select encoding options (One-Hot, Label, Ordinal, or 
   Frequency encoding) for category columns and scaling strategies 
   (StandardScaler, MinMaxScaler, RobustScaler) for numerical values.
7. Model Selection & Tuning: Detects task type and presents corresponding 
   algorithm options (e.g. XGBoost, Random Forest, Decision Tree, Logistic 
   Regression). Users can choose a target variable and set hyperparameters.
8. Model Training & Evaluation: Fits the algorithm on the dataset, evaluates 
   on a test split, prints scoring results (Accuracy, F1, Precision, R2, 
   RMSE, Silhouette score, etc.), and dumps the trained model file (`model.pkl`).
9. App Deployment / Test Predictions: Enter values for model features to run 
   live predictions, or download the model file and processed dataset directly.

------------------------------------------------------------------------
4. INSTALLATION AND SETUP
------------------------------------------------------------------------

Prerequisites:
- Python 3.10+ (with pip)
- Node.js (v18+) and npm
- MySQL Server instance
- MongoDB Server instance
- Cloudinary developer credentials

---
A. BACKEND INSTALLATION & RUNNING
---
1. Navigate to the backend folder:
   cd backend

2. Create a virtual environment:
   python -m venv venv
   source venv/bin/activate  # On Linux/macOS
   .\venv\Scripts\activate   # On Windows (PowerShell)

3. Install required libraries:
   pip install -r requirements.txt

4. Configure the environment variables. Create a `.env` file in `backend/`:
   SECRET_KEY=your_flask_secret_key
   JWT_ALGORITHM=HS256
   JWT_EXP_MINUTES=60
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=mlverse
   MONGO_URI=mongodb://localhost:27017/
   MONGO_DB_NAME=mlverse_db
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URLS=http://localhost:5173
   OTP_EXPIRY_SECONDS=300
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_app_password

5. Set up the MySQL database schema. Execute the schema queries defined in:
   backend/db/setup_db.sql

6. Launch the backend API server:
   python run.py

   The server runs locally at: http://localhost:5000

---
B. FRONTEND INSTALLATION & RUNNING
---
1. Navigate to the frontend folder:
   cd frontend

2. Install npm packages:
   npm install

3. Run the development server:
   npm run dev

   The React client runs locally at: http://localhost:5173

========================================================================
