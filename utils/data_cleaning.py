import pandas as pd
import numpy as np

def check_missing_values(df):
    missing_count = df.isna().sum()
    print("Count total missing values per column:", missing_count.to_dict())

    if missing_count.any():
        print("Dataset has missing values")
        strategy = collect_missing_strategy(df, missing_count)
        return apply_missing_strategy(df, strategy)
    
    print("Dataset has zero missing values")
    return df


def collect_missing_strategy(df, missing_count):
    strategy = {}

    for col in missing_count[missing_count > 0].index:
        dtype = df[col].dtype
        print(f"\nColumn: {col} ({dtype})")

        if pd.api.types.is_numeric_dtype(dtype):
            print("1. Drop row")
            print("2. Fill with mean")
            print("3. Fill with median")
            print("4. Fill with mode")
            print("5. Fill with specific value")

            choice = input("Enter choice (1-5): ").strip()

            if choice in {"1", "2", "3", "4"}:
                strategy[col] = {
                    "1": "drop",
                    "2": "mean",
                    "3": "median",
                    "4": "mode"
                }[choice]
            elif choice == "5":
                strategy[col] = float(input("Enter specific value: "))
            else:
                raise ValueError("Invalid choice")

        else:
            print("1. Drop row")
            print("2. Fill with mode")
            print("3. Fill with specific value")

            choice = input("Enter choice (1-3): ").strip()

            if choice == "1":
                strategy[col] = "drop"
            elif choice == "2":
                strategy[col] = "mode"
            elif choice == "3":
                strategy[col] = input("Enter specific value: ")
            else:
                raise ValueError("Invalid choice")

    return strategy


def apply_missing_strategy(df, strategy):
    df = df.copy()

    for col, method in strategy.items():
        if method == "drop":
            df = df.dropna(subset=[col])

        elif method == "mean":
            if pd.api.types.is_numeric_dtype(df[col].dtype):
                df[col] = df[col].astype(float)
            df[col] = df[col].fillna(df[col].mean())

        elif method == "median":
            if pd.api.types.is_numeric_dtype(df[col].dtype):
                df[col] = df[col].astype(float)
            df[col] = df[col].fillna(df[col].median())

        elif method == "mode":

            mode_val = df[col].mode()
            if not mode_val.empty:
                df[col] = df[col].fillna(mode_val.iloc[0])

        else:
            df[col] = df[col].fillna(method)

    return df

def data_cleaning_pipeline(df):
    df = check_missing_values(df)
    return df

def remove_columns(df):
    cols = df.columns.tolist()
    for i in range(len(cols)):
        print(i,cols[i])
    columns_to_remove = input("Enter columns numbers to remove (comma separated) :").split(",")
    columns_to_remove = [cols[int(i)] for i in columns_to_remove if i.isdigit()]
    print(f"Removing columns: {columns_to_remove}")
    return df.drop(columns_to_remove,axis=1)
