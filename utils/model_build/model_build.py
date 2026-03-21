from model_build.classification import logistic_regression, svc, random_forest, decision_tree,model_visualization
from model_build.regression import linear_regression, regression_visualization,decision_tree_regression,svr_regression,random_forest_regression
def run_model_selection(df):
    target = input("Enter target column name (press Enter if none): ").strip()

    domains = ["supervised", "unsupervised"]

    try:
        domain_choice = int(input("Enter domain (1.supervised 2.unsupervised): "))
        domain = domains[domain_choice - 1]
    except:
        print("Invalid domain choice.")
        return df

    codomain1 = None
    codomain2 = None

    if domain == "supervised":
        if target not in df.columns:
            print("Invalid target column.")
            return df

        X = df.drop(columns=[target])
        y = df[target]

        types = ["classification", "regression"]

        try:
            type_choice = int(input("1.classification 2.regression: "))
            codomain1 = types[type_choice - 1]
        except:
            print("Invalid type choice.")
            return df

        if codomain1 == "classification":
            models = ["logistic", "svc", "random forest", "decision tree"]

            try:
                model_choice = int(input(
                    "Select model (1.logistic 2.svc 3.random forest 4.decision tree): "
                ))
                codomain2 = models[model_choice - 1]
            except:
                print("Invalid model choice.")
                return df

        elif codomain1 == "regression":
            models = ["linear","decision tree", "random forest", "svr"]

            try:
                model_choice = int(input(
                    "Select model (1.linear 2.decision tree 3.random forest 4.svr): "
                ))
                codomain2 = models[model_choice - 1]
            except:
                print("Invalid model choice.")
                return df

        ml_type(domain, codomain1, codomain2, X, y)

    elif domain == "unsupervised":
        X = df
        y = None

        types = ["clustering", "association rule", "dimensionality reduction"]

        try:
            type_choice = int(input(
                "1.clustering 2.association rule 3.dimensionality reduction: "
            ))
            codomain1 = types[type_choice - 1]
        except:
            print("Invalid type choice.")
            return df

        if codomain1 == "clustering":
            models = ["kmeans", "dbscan", "hierarchical"]

            try:
                model_choice = int(input(
                    "Select model (1.kmeans 2.dbscan 3.hierarchical): "
                ))
                codomain2 = models[model_choice - 1]
            except:
                print("Invalid model choice.")
                return df

        elif codomain1 == "association rule":
            models = ["apriori", "fp-growth"]

            try:
                model_choice = int(input(
                    "Select model (1.apriori 2.fp-growth): "
                ))
                codomain2 = models[model_choice - 1]
            except:
                print("Invalid model choice.")
                return df

        elif codomain1 == "dimensionality reduction":
            models = ["pca", "svd", "tsne"]

            try:
                model_choice = int(input(
                    "Select model (1.pca 2.svd 3.tsne): "
                ))
                codomain2 = models[model_choice - 1]
            except:
                print("Invalid model choice.")
                return df

        ml_type(domain, codomain1, codomain2, X, y)

    return domain, codomain1, codomain2, X, y




def ml_type(domain, codomain1, codomain2, x, y=None):
    print(f"Domain: {domain}")
    print(f"Type: {codomain1}")
    print(f"Model: {codomain2}")

    if domain == "supervised":

        if codomain1 == "classification":
            if codomain2 == "logistic":
                model, results = logistic_regression(x, y)

            elif codomain2 == "svc":
                model, results = svc(x, y)

            elif codomain2 == "random forest":
                model, results = random_forest(x, y)

            elif codomain2 == "decision tree":
                model, results = decision_tree(x, y)

            else:
                print("Invalid classification model")
                return

            print("Model Results:", results)
            model_visualization(model, x, y)
            return model, results

        elif codomain1 == "regression":
            print(f"Selected model: {codomain2} for regression")
            if codomain2 == "linear":
                model, results = linear_regression(x, y)
            elif codomain2 == "decision tree":
                model, results = decision_tree_regression(x, y)
            elif codomain2 == "svr":
                model, results = svr_regression(x, y)
            elif codomain2 == "random forest":
                model,results = random_forest_regression(x,y)
            else:
                print("Invalid regression model")
                return

            print("Model Results:", results)
            regression_visualization(model, x, y)
            return model, results

    elif domain == "unsupervised":

        if codomain1 == "clustering":
            print(f"Selected model: {codomain2} for clustering")
            print("Clustering module not implemented yet")

        elif codomain1 == "association rule":
            print(f"Selected model: {codomain2} for association rule mining")
            print("Association rule module not implemented yet")

        elif codomain1 == "dimensionality reduction":
            print(f"Selected model: {codomain2} for dimensionality reduction")
            print("Dimensionality reduction module not implemented yet")

    else:
        print("Invalid domain")