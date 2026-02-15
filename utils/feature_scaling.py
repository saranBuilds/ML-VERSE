import pandas as pd
from sklearn.preprocessing import StandardScaler,RobustScaler


scaler = StandardScaler()
robust = RobustScaler()
def feature_scale(x_train,x_test,scaler="std"):
    if scaler =="std":
        x_train_scaled = scaler.fit_transform(x_train)
        x_test_scaled  = scaler.fit_transform(x_test)
    elif scaler=="robust":
        x_train_scaled = robust.fit_transform(x_train)
        x_test_scaled  = robust.fit_transform(x_test)
    return x_train_scaled,x_test_scaled