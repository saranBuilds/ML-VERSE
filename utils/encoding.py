def check_categorical_columns(df):
    cat_cols = df.select_dtypes(
        include=["object", "category", "string"]
    ).columns.tolist()

    print("Categorical columns:", cat_cols)
    return cat_cols
def encode_strategy(df, cat_cols):
    strategy = {}

    print("""
Choose encoding type:
1. Label Encoding
2. Ordinal Encoding
3. One-Hot Encoding
4. Frequency Encoding
""")

    for col in cat_cols:
        print(f"\nColumn: {col}")
        print(f"Unique values: {df[col].unique()}")

        choice = int(input("Enter choice (1-4): "))

        if choice == 1:
            strategy[col] = "label"
        elif choice == 2:
            strategy[col] = "ordinal"
        elif choice == 3:
            strategy[col] = "onehot"
        elif choice == 4:
            strategy[col] = "frequency"
        else:
            print("Invalid choice, defaulting to One-Hot")
            strategy[col] = "onehot"

    return strategy

import pandas as pd
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder

def encode_categorical_columns(df, strategy):
    df = df.copy()

    for col, method in strategy.items():

        if method == "label":
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))

        elif method == "ordinal":
            oe = OrdinalEncoder()
            df[col] = oe.fit_transform(df[[col]])

        elif method == "onehot":
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
            df = pd.concat([df.drop(columns=[col]), dummies], axis=1)

        elif method == "frequency":
            freq_map = df[col].value_counts(normalize=True)
            df[col] = df[col].map(freq_map)

    return df
