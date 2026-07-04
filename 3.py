# pyrefly: ignore [missing-import]
from sklearn.datasets import fetch_california_housing
import pandas as pd
df = fetch_california_housing()
x = pd.DataFrame(df.data,columns=df.feature_names)
y = pd.DataFrame(df.target,columns=['target'])

