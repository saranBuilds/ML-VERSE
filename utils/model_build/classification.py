from sklearn.model_selection import train_test_split, learning_curve
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_curve,
    auc,
    precision_recall_curve,
)
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


# ---------- EVALUATION CORE ----------

def evaluate_model(model, x, y, test_size=0.2):
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=test_size, random_state=42, stratify=y
    )

    model.fit(x_train, y_train)
    y_pred = model.predict(x_test)

    results = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average="weighted", zero_division=0),
        "recall": recall_score(y_test, y_pred, average="weighted", zero_division=0),
        "f1_score": f1_score(y_test, y_pred, average="weighted", zero_division=0),
    }

    return model, results


# ---------- MODEL WRAPPERS ----------

def logistic_regression(x, y, test_size=0.2):
    model = LogisticRegression(max_iter=1000)
    return evaluate_model(model, x, y, test_size)


def svc(x, y, test_size=0.2):
    model = SVC(probability=True)  # ✅ important fix
    return evaluate_model(model, x, y, test_size)


def random_forest(x, y, test_size=0.2):
    model = RandomForestClassifier()
    return evaluate_model(model, x, y, test_size)


def decision_tree(x, y, test_size=0.2):
    model = DecisionTreeClassifier()
    return evaluate_model(model, x, y, test_size)


# ---------- VISUALIZATION ----------

def model_visualization(model, x, y, test_size=0.2):
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=test_size, random_state=42, stratify=y
    )

    model.fit(x_train, y_train)
    y_pred = model.predict(x_test)

    # ---------- CONFUSION MATRIX ----------
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.show()

    # ---------- ROC CURVE (binary only) ----------
    if len(np.unique(y)) == 2:
        if hasattr(model, "predict_proba"):
            y_scores = model.predict_proba(x_test)[:, 1]
        elif hasattr(model, "decision_function"):
            y_scores = model.decision_function(x_test)
        else:
            y_scores = None

        if y_scores is not None:
            fpr, tpr, _ = roc_curve(y_test, y_scores)
            roc_auc = auc(fpr, tpr)

            plt.figure(figsize=(5, 4))
            plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}")
            plt.plot([0, 1], [0, 1], linestyle="--")
            plt.xlabel("False Positive Rate")
            plt.ylabel("True Positive Rate")
            plt.title("ROC Curve")
            plt.legend()
            plt.show()

            # ---------- PRECISION-RECALL ----------
            precision, recall, _ = precision_recall_curve(y_test, y_scores)

            plt.figure(figsize=(5, 4))
            plt.plot(recall, precision)
            plt.xlabel("Recall")
            plt.ylabel("Precision")
            plt.title("Precision-Recall Curve")
            plt.show()
    else:
        print("ROC & PR curves skipped (multiclass detected)")

    # ---------- LEARNING CURVE ----------
    train_sizes, train_scores, val_scores = learning_curve(
        model,
        x,
        y,
        cv=5,
        scoring="accuracy",
        n_jobs=-1,
        train_sizes=np.linspace(0.1, 1.0, 5),
    )

    train_mean = np.mean(train_scores, axis=1)
    val_mean = np.mean(val_scores, axis=1)

    plt.figure(figsize=(5, 4))
    plt.plot(train_sizes, train_mean, label="Training Score")
    plt.plot(train_sizes, val_mean, label="Validation Score")
    plt.xlabel("Training Size")
    plt.ylabel("Accuracy")
    plt.title("Learning Curve")
    plt.legend()
    plt.show()