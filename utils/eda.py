import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
def describe(df):
    print(df.describe())

def correlation(df):
    print(df.corr())

def basic_visualization(df):
    numeric_df = df.select_dtypes(include=["int64", "float64"])

    sns.pairplot(numeric_df)
    plt.show()

    corr = numeric_df.corr()
    sns.heatmap(corr, annot=True)
    plt.show()

    numeric_df.hist(bins=15)
    plt.show()

    sns.boxplot(data=numeric_df)
    plt.xticks(rotation=45)
    plt.show()


