
from flask import jsonify
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

def EDA(df):
    shape =  df.shape 
    columns =  df.columns.tolist()
    
    describe = df.describe()
    try:
        describe_object = df.describe(include=['object'])
    except ValueError:
        describe_object = pd.DataFrame()
        
    return shape, columns, describe, describe_object


def check_missing_values(df):
    missing_count = df.isna().sum()
    print("Count total missing values per column:", missing_count.to_dict())

    if missing_count.any():
        return collect_missing_strategy(df, missing_count)
    else:
        return False


def collect_missing_strategy(df, missing_count):
    missing_columns_names = missing_count[missing_count > 0].index.tolist()
    missing_columns = []
    for col in missing_columns_names:
        dtype = df[col].dtype
        if pd.api.types.is_numeric_dtype(dtype):
            missing_columns.append({"name": col, "type": "numeric"})
        else:
            missing_columns.append({"name": col, "type": "categorical"})
    return missing_columns

def apply_missing_strategy(df, missing_value_strategy):
    df = df.copy()

    for col, method in missing_value_strategy.items():
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


def remove_columns(df,columns_to_remove):
    return df.drop(columns_to_remove,axis=1)



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



from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler


def feature_scale(df: pd.DataFrame, strategy: dict) -> pd.DataFrame:
    """
    Apply column-level scaling according to `strategy`.

    strategy keys are column names; values are one of:
        'standard'   – StandardScaler (zero mean, unit variance)
        'minmax'     – MinMaxScaler   (0 to 1 range)
        'robust'     – RobustScaler   (median-based, outlier-resistant)

    Only numeric columns that exist in the dataframe are scaled.
    Non-numeric columns are silently skipped.
    """
    df = df.copy()

    for col, method in strategy.items():
        if col not in df.columns:
            continue
        if not pd.api.types.is_numeric_dtype(df[col]):
            continue

        values = df[[col]].astype(float)

        if method == "standard" or method == "std":
            scaler = StandardScaler()
        elif method == "minmax":
            scaler = MinMaxScaler()
        elif method == "robust":
            scaler = RobustScaler()
        else:
            continue  # unknown method → skip

        df[col] = scaler.fit_transform(values).flatten()

    return df