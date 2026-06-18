# Basic 
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB

# Distance-Based
from sklearn.neighbors import KNeighborsClassifier

# Tree-Based
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

# Advanced Boosting
import xgboost as xgb
import lightgbm as lgb
import catboost as cb

# Margin-Based
from sklearn.svm import SVC


# 1. Logistic Regression
log_model = LogisticRegression(
    penalty='l2',             # Regularization ('l1', 'l2', 'elasticnet', or None)
    C=1.0,                    # Inverse of regularization strength (smaller = stronger penalty)
    solver='lbfgs',           # Algorithm to use ('liblinear' for small datasets, 'lbfgs' for multiclass)
    max_iter=1000,            # Maximum number of iterations taken for the solvers to converge
    class_weight='balanced',  # Adjusts weights inversely proportional to class frequencies (great for imbalanced data)
    random_state=42
)

# 2. Naive Bayes 
# (Very few hyperparameters by design)

# For continuous data
gnb_model = GaussianNB(
    var_smoothing=1e-9        # Portion of the largest variance of all features added to variances for calculation stability
)

# For discrete counts (like word counts in text)
mnb_model = MultinomialNB(
    alpha=1.0                 # Additive (Laplace/Lidstone) smoothing parameter
)

# For binary/boolean features
bnb_model = BernoulliNB(
    alpha=1.0,
    binarize=0.0              # Threshold for mapping to booleans
)


# 3. K-Nearest Neighbors (KNN)
knn_model = KNeighborsClassifier(
    n_neighbors=5,            # Number of neighbors to use
    weights='uniform',        # 'uniform' (all points equal) or 'distance' (closer points have more weight)
    metric='minkowski',       # Distance metric to use ('euclidean', 'manhattan', etc.)
    p=2,                      # Power parameter for the Minkowski metric (2 = Euclidean distance)
    n_jobs=-1
)

# 4. Decision Tree Classifier
dt_model = DecisionTreeClassifier(
    criterion='gini',         # Function to measure the quality of a split ('gini' or 'entropy')
    max_depth=None,           # Maximum depth of the tree (tune to prevent overfitting)
    min_samples_split=2,      # Minimum number of samples required to split an internal node
    min_samples_leaf=1,       # Minimum number of samples required to be at a leaf node
    class_weight=None,
    random_state=42
)

# 5. Random Forest Classifier
rf_model = RandomForestClassifier(
    n_estimators=100,         # Number of trees in the forest
    criterion='gini',
    max_depth=None,
    min_samples_split=2,
    max_features='sqrt',      # Number of features to consider when looking for the best split
    class_weight='balanced',  # Automatically handle imbalanced classes
    n_jobs=-1,
    random_state=42
)
# 6. Gradient Boosting Classifier
gb_model = GradientBoostingClassifier(
    n_estimators=100,         # Number of boosting stages
    learning_rate=0.1,        # Shrinks the contribution of each tree
    max_depth=3,              # Maximum depth of the individual estimators
    subsample=1.0,            # Fraction of samples used for fitting base learners
    random_state=42
)

# 7. XGBoost
xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=6,
    subsample=0.8,            # Subsample ratio of the training instances
    colsample_bytree=0.8,     # Subsample ratio of columns when constructing each tree
    objective='binary:logistic', # Use 'multi:softmax' for multiclass
    scale_pos_weight=1,       # Balances positive and negative weights (useful for imbalanced classes)
    n_jobs=-1,
    random_state=42
)

# 8. LightGBM
lgb_model = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    num_leaves=31,            # Max number of leaves in one tree
    max_depth=-1,
    subsample=0.8,
    colsample_bytree=0.8,
    class_weight='balanced',
    n_jobs=-1,
    random_state=42
)

# 9. CatBoost
cat_model = cb.CatBoostClassifier(
    iterations=1000,
    learning_rate=0.1,
    depth=6,
    l2_leaf_reg=3,
    auto_class_weights='Balanced', # Automatically balances weights for imbalanced classes
    verbose=0,                # Set to 0 to suppress training output
    random_state=42
)

# 10. Support Vector Machine (SVC)
svc_model = SVC(
    C=1.0,                    # Regularization parameter (trade-off between wide margin and classification errors)
    kernel='rbf',             # Kernel type ('linear', 'poly', 'rbf', 'sigmoid')
    degree=3,                 # Degree of the polynomial kernel function (if kernel='poly')
    gamma='scale',            # Kernel coefficient ('scale' or 'auto')
    probability=True,         # Set to True if you need predict_proba() to get probability scores (slows down training)
    class_weight='balanced',
    random_state=42
)