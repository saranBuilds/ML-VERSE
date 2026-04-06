# Basic & Regularized
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, BayesianRidge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# Tree-Based
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

# Advanced Boosting
import xgboost as xgb
import lightgbm as lgb
import catboost as cb

# Others
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C

# 1. Linear Regression
# Very few hyperparameters; mostly deciding whether to fit the y-intercept
lr_model = LinearRegression(
    fit_intercept=True, # Calculate the intercept for this model
    n_jobs=-1           # Use all processors (good for large datasets)
)

# 2. Polynomial Regression
# Handled via a pipeline: first generate polynomial features, then fit a linear model
poly_model = make_pipeline(
    PolynomialFeatures(
        degree=2,              # The degree of the polynomial features
        include_bias=False     # Usually False if LinearRegression has fit_intercept=True
    ),
    LinearRegression()
)

# 3. Ridge Regression
ridge_model = Ridge(
    alpha=1.0,          # Regularization strength (larger = stronger penalty)
    solver='auto',      # Algorithm to use for optimization ('cholesky', 'sag', etc.)
    random_state=42
)

# 4. Lasso Regression
lasso_model = Lasso(
    alpha=1.0,          # Regularization strength (controls feature dropping)
    max_iter=1000,      # Maximum number of iterations for the solver
    tol=1e-4,           # Tolerance for the optimization
    random_state=42
)

# 5. Elastic Net
elastic_net_model = ElasticNet(
    alpha=1.0,          # Overall regularization strength
    l1_ratio=0.5,       # 0 = Ridge, 1 = Lasso, 0.5 = 50/50 mix
    max_iter=1000,
    random_state=42
)

# 6. Decision Tree Regressor
dt_model = DecisionTreeRegressor(
    max_depth=None,           # Maximum depth of the tree (tune to prevent overfitting)
    min_samples_split=2,      # Minimum samples required to split an internal node
    min_samples_leaf=1,       # Minimum samples required to be at a leaf node
    random_state=42
)

# 7. Random Forest Regressor
rf_model = RandomForestRegressor(
    n_estimators=100,         # Number of trees in the forest
    max_depth=None,           # Maximum depth of trees
    min_samples_split=2,      
    max_features=1.0,       # Number of features to consider when looking for the best split
    n_jobs=-1,                # Run in parallel
    random_state=42
)

# 8. Gradient Boosting Regressor
gb_model = GradientBoostingRegressor(
    n_estimators=100,         # Number of boosting stages to perform
    learning_rate=0.1,        # Shrinks the contribution of each tree (trade-off with n_estimators)
    max_depth=3,              # Maximum depth of the individual regression estimators
    subsample=1.0,            # Fraction of samples used for fitting individual base learners
    random_state=42
)

# 9. XGBoost
xgb_model = xgb.XGBRegressor(
    n_estimators=100,         # Number of trees
    learning_rate=0.1,        # Step size shrinkage
    max_depth=6,              # Maximum depth of a tree
    subsample=0.8,            # Subsample ratio of the training instances
    colsample_bytree=0.8,     # Subsample ratio of columns when constructing each tree
    n_jobs=-1,
    random_state=42
)

# 10. LightGBM
lgb_model = lgb.LGBMRegressor(
    n_estimators=100,
    learning_rate=0.1,
    num_leaves=31,            # Max number of leaves in one tree (main parameter for controlling complexity)
    max_depth=-1,             # Limit the max depth for tree model (-1 means no limit)
    subsample=0.8,
    colsample_bytree=0.8,
    n_jobs=-1,
    random_state=42
)

# 11. CatBoost
cat_model = cb.CatBoostRegressor(
    iterations=1000,          # Number of trees (similar to n_estimators)
    learning_rate=0.1,
    depth=6,                  # Depth of the tree
    l2_leaf_reg=3,            # L2 regularization term
    loss_function='RMSE',     
    verbose=0,                # Set to 0 to suppress training output
    random_state=42
)

# 12. Support Vector Regression (SVR)
svr_model = SVR(
    kernel='rbf',             # Specifies the kernel type ('linear', 'poly', 'rbf', 'sigmoid')
    C=1.0,                    # Regularization parameter (trade-off between margin width and error)
    epsilon=0.1,              # Epsilon in the epsilon-SVR model (no penalty for errors within this distance)
    gamma='scale'             # Kernel coefficient
)

# 13. K-Nearest Neighbors (KNN Regressor)
knn_model = KNeighborsRegressor(
    n_neighbors=5,            # Number of neighbors to use
    weights='uniform',        # 'uniform' (all points weighted equally) or 'distance' (closer points weighted more)
    algorithm='auto',         # Algorithm to compute nearest neighbors ('ball_tree', 'kd_tree', 'brute')
    n_jobs=-1
)

# 14. Bayesian Regression
bayesian_model = BayesianRidge(
    max_iter=300,               # Maximum number of iterations
    tol=1e-3,                 # Stop criterion
    alpha_1=1e-6,             # Hyperparameter for the Gamma distribution prior over the alpha parameter
    lambda_1=1e-6             # Hyperparameter for the Gamma distribution prior over the lambda parameter
)

# 15. Gaussian Process Regression
# Requires defining a kernel function first
kernel = C(1.0, (1e-3, 1e3)) * RBF(10, (1e-2, 1e2))

gpr_model = GaussianProcessRegressor(
    kernel=kernel,
    alpha=1e-10,              # Value added to the diagonal of the kernel matrix during fitting (handles noise)
    n_restarts_optimizer=0,   # Number of restarts of the optimizer for finding the kernel's parameters
    random_state=42
)

