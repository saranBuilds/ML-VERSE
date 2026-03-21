from sklearn.model_selection import train_test_split, learning_curve
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


# ---------- EVALUATION CORE ----------

def evaluate_regression_model(model, x, y, test_size=0.2):
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=test_size, random_state=42
    )

    model.fit(x_train, y_train)
    y_pred = model.predict(x_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    results = {
        "r2_score": r2_score(y_test, y_pred),
        "mae": mean_absolute_error(y_test, y_pred),
        "mse": mean_squared_error(y_test, y_pred),
        "rmse": rmse,
    }

    return model, results


# ---------- MODEL WRAPPERS ----------

def linear_regression(x, y, test_size=0.2):
    model = LinearRegression()
    return evaluate_regression_model(model, x, y, test_size)


def svr_regression(x, y, test_size=0.2):
    model = SVR()
    return evaluate_regression_model(model, x, y, test_size)


def random_forest_regression(x, y, test_size=0.2):
    model = RandomForestRegressor()
    return evaluate_regression_model(model, x, y, test_size)


def decision_tree_regression(x, y, test_size=0.2):
    model = DecisionTreeRegressor()
    return evaluate_regression_model(model, x, y, test_size)


# ---------- VISUALIZATION ----------

def regression_visualization(model, x, y, test_size=0.2):
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=test_size, random_state=42
    )

    model.fit(x_train, y_train)
    y_pred = model.predict(x_test)

    # ---------- RESIDUAL PLOT ----------
    residuals = y_test - y_pred

    plt.figure(figsize=(5, 4))
    plt.scatter(y_pred, residuals)
    plt.axhline(y=0)
    plt.xlabel("Predicted Values")
    plt.ylabel("Residuals")
    plt.title("Residual Plot")
    plt.show()

    # ---------- ACTUAL VS PREDICTED ----------
    plt.figure(figsize=(5, 4))
    plt.scatter(y_test, y_pred)
    plt.plot(
        [y_test.min(), y_test.max()],
        [y_test.min(), y_test.max()],
        linestyle="--",
    )
    plt.xlabel("Actual Values")
    plt.ylabel("Predicted Values")
    plt.title("Actual vs Predicted")
    plt.show()

    # ---------- LEARNING CURVE ----------
    train_sizes, train_scores, val_scores = learning_curve(
        model,
        x,
        y,
        cv=5,
        scoring="r2",
        n_jobs=-1,
        train_sizes=np.linspace(0.1, 1.0, 5),
    )

    train_mean = np.mean(train_scores, axis=1)
    val_mean = np.mean(val_scores, axis=1)

    plt.figure(figsize=(5, 4))
    plt.plot(train_sizes, train_mean, label="Training Score")
    plt.plot(train_sizes, val_mean, label="Validation Score")
    plt.xlabel("Training Size")
    plt.ylabel("R2 Score")
    plt.title("Learning Curve")
    plt.legend()
    plt.show()