from flask import Blueprint, request, jsonify, session, current_app
import pandas as pd
import os
import pandas as pd
from flask import request, jsonify, session
from werkzeug.utils import secure_filename
import joblib

from backend.app.authentication.jwt import token_required

home_bp = Blueprint("home",__name__)

@home_bp.route('/home',methods = ['GET'])
@token_required
def home(token_data):
    return jsonify({
        'message': 'Welcome to the protected route',
        'user': token_data['user']
    })

@home_bp.route('/home/category', methods=['POST'])
@token_required
def category(token_data):
    data = request.get_json()

    learn_category = data.get('category')
    type_category = data.get('type')

    if not learn_category or not type_category:
        return jsonify({"error": "Category and type are required"}), 400

    # 🔥 Store in session
    session['ml_category'] = learn_category
    session['ml_type'] = type_category
    print(learn_category)
    print(type_category)

    return jsonify({
        "message": "Category stored successfully",
        "category": learn_category,
        "type": type_category
    })



UPLOAD_FOLDER = "uploads"

@home_bp.route('/home/category/dataset_upload', methods=['POST'])
@token_required
def dataset_upload(token_data):
    preview_rows = 100

    if 'dataset' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    dataset = request.files['dataset']
    print(dataset)

    if dataset.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(dataset.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    dataset.save(file_path)

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(file_path, nrows=preview_rows)
        else:
            df = pd.read_excel(file_path, nrows=preview_rows)

        df = df.convert_dtypes()

        # 🔥 Store in session
        session['dataset_path'] = file_path

        # Convert preview to JSON
        preview = df.head(50).to_dict(orient="records")
        columns = list(df.columns)

        return jsonify({
            "message": "Dataset uploaded successfully",
            "filename": filename,
            "columns": columns,
            "preview": preview
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@home_bp.route('/home/mlprocess/DataCleaning/remove_columns',methods=['POST'])
@token_required
def remove_columns(token_data):
    try:
        from backend.app.Main.utils import remove_columns
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
        
        df = df.convert_dtypes()
        columns_to_remove = request.get_json().get('remove_col', [])
        df = remove_columns(df,columns_to_remove)
        
        # Save modifications back to file
        if dataset_path.endswith(".csv"):
            df.to_csv(dataset_path, index=False)
        else:
            df.to_excel(dataset_path, index=False)
            
        session['dataset_path'] = dataset_path
        return jsonify({
            "message": "Columns removed successfully"
        }),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/DataCleaning/checking_missing_values',methods=['POST'])
@token_required
def checking_missing_values(token_data):
    try:
        from backend.app.Main.utils import check_missing_values, remove_columns,collect_missing_strategy
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
        
        df = df.convert_dtypes()
        missing_columns = check_missing_values(df)
        if missing_columns:
            return jsonify({
                "message": "Missing values found",
                "missing_columns": missing_columns
            })

        else:
            return jsonify({
                "message": "No missing values found"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@home_bp.route('/home/mlprocess/DataCleaning/apply_missing_strategy',methods=['POST'])
@token_required
def apply_missing_strategy(token_data):
    try:
        from backend.app.Main.utils import apply_missing_strategy
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
        
        df = df.convert_dtypes()
        strategy = request.get_json().get('missing_value_strategy', {})
        df = apply_missing_strategy(df,strategy)

        # Save modifications back to file
        if dataset_path.endswith(".csv"):
            df.to_csv(dataset_path, index=False)
        else:
            df.to_excel(dataset_path, index=False)

        session['dataset_path'] = dataset_path
        return jsonify({
            "message": "Missing values applied successfully"
        }),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@home_bp.route('/home/mlprocess/EDA', methods=['POST', 'GET'])
@token_required
def eda(token_data):
    try:
        from backend.app.Main.utils import EDA
        dataset_path = session.get('dataset_path')
        
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
            
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)

        shape, columns, describe, describe_object = EDA(df)
        object_columns = describe_object.columns.tolist()
        session['object_columns'] = object_columns
        return jsonify({
            "message": "EDA performed successfully",
            "shape": shape,
            "columns": columns,
            "describe": describe.replace({pd.NA: None}).to_dict() if hasattr(describe, 'to_dict') else {},
            "describe_object": describe_object.replace({pd.NA: None}).to_dict() if not describe_object.empty else {}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/feature_engineering/apply_encoding',methods = ['POST'])
@token_required
def apply_encoding(token_data):
    try:
        from backend.app.Main.utils import encode_categorical_columns
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
        
        df = df.convert_dtypes()
        strategy = request.get_json().get('encoding_strategy', {})
        df = encode_categorical_columns(df,strategy)

        # Save modifications back to file
        if dataset_path.endswith(".csv"):
            df.to_csv(dataset_path, index=False)
        else:
            df.to_excel(dataset_path, index=False)

        session['dataset_path'] = dataset_path
        return jsonify({
            "message": "Encoding applied successfully"
        }),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@home_bp.route('/home/mlprocess/feature_engineering/apply_scaling',methods = ['POST'])
@token_required
def apply_scaling(token_data):
    try:
        from backend.app.Main.utils import feature_scale
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset path found in session. Please upload a dataset first."}), 400
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
        
        df = df.convert_dtypes()
        strategy = request.get_json().get('scaling_strategy', {})
        df = feature_scale(df,strategy)

        # Save modifications back to file
        if dataset_path.endswith(".csv"):
            df.to_csv(dataset_path, index=False)
        else:
            df.to_excel(dataset_path, index=False)

        session['dataset_path'] = dataset_path
        return jsonify({
            "message": "Scaling applied successfully"
        }),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@home_bp.route('/home/mlprocess/regression',methods=['POST'])
@token_required
def regression(token_data):
    try:
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import r2_score, mean_squared_error
        import numpy as np
        import joblib
        import os
        
        from backend.app.Main.regression import (
            lr_model, ridge_model, svr_model, dt_model, rf_model, xgb_model
        )
        
        data = request.get_json()
        target_column = data.get('target_column')
        test_size = float(data.get('test_size', 0.2))
        model_name = data.get('model_name')
        params = data.get('params', {})
        
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset found in session."}), 400
            
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
            
        # Drop missing values if any remain
        df = df.dropna()
        
        if target_column not in df.columns:
            return jsonify({"error": f"Target column '{target_column}' not found"}), 400
            
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Convert any remaining categorical to dummies aggressively to prevent fit errors
        X = pd.get_dummies(X, drop_first=True)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
        model_map = {
            'Linear': lr_model,
            'Ridge': ridge_model,
            'SVR': svr_model,
            'DecisionTree': dt_model,
            'RandomForest': rf_model,
            'XGBoost': xgb_model
        }
        
        if model_name not in model_map:
            return jsonify({"error": f"Model '{model_name}' not supported"}), 400
            
        model = model_map[model_name]
        
        if params:
            # Set dynamically parsed params
            model.set_params(**params)
            
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        r2 = float(r2_score(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        
        # Save model and dataset
        model_path = os.path.join(UPLOAD_FOLDER, 'model.pkl')
        dataset_csv_path = os.path.join(UPLOAD_FOLDER, 'dataset.csv')
        
        joblib.dump(model, model_path)
        df.to_csv(dataset_csv_path, index=False)
        
        session['feature_columns'] = list(X.columns)
        
        return jsonify({
            "message": "Model trained successfully!",
            "model_name": model_name,
            "r2_score": r2,
            "rmse": rmse,
            "feature_columns": list(X.columns)
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/classification',methods=['POST'])
@token_required
def classification(token_data):
    try:
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        import numpy as np
        import joblib
        import os
        
        from backend.app.Main.classification import (
            log_model, gnb_model, mnb_model, bnb_model, knn_model, dt_model,
            rf_model, gb_model, xgb_model, lgb_model, cat_model, svc_model
        )
        
        data = request.get_json()
        target_column = data.get('target_column')
        test_size = float(data.get('test_size', 0.2))
        model_name = data.get('model_name')
        params = data.get('params', {})
        
        dataset_path = session.get('dataset_path')
        if not dataset_path:
            return jsonify({"error": "No dataset found in session."}), 400
            
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
            
        # Drop missing values if any remain
        df = df.dropna()
        
        if target_column not in df.columns:
            return jsonify({"error": f"Target column '{target_column}' not found"}), 400
            
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Convert any remaining categorical to dummies aggressively to prevent fit errors
        X = pd.get_dummies(X, drop_first=True)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
        model_map = {
            'Logistic Regression': log_model,
            'GaussianNB': gnb_model,
            'MultinomialNB': mnb_model,
            'BernoulliNB': bnb_model,
            'K-Nearest Neighbors': knn_model,
            'Decision Tree': dt_model,
            'Random Forest': rf_model,
            'Gradient Boosting': gb_model,
            'XGBoost': xgb_model,
            'LightGBM': lgb_model,
            'CatBoost': cat_model,
            'SVC': svc_model
        }
        
        if model_name not in model_map:
            return jsonify({"error": f"Model '{model_name}' not supported"}), 400
            
        model = model_map[model_name]
        
        if params:
            try:
                model.set_params(**params)
            except Exception as param_err:
                print("Warning: unable to set params", param_err)
            
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        # Use macro average for multiclass gracefully
        accuracy = float(accuracy_score(y_test, y_pred))
        precision = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
        recall = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))
        
        # Save model and dataset
        model_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, 'model.pkl'))
        dataset_csv_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, 'dataset.csv'))
        
        joblib.dump(model, model_path)
        df.to_csv(dataset_csv_path, index=False)
        
        session['feature_columns'] = list(X.columns)
        
        return jsonify({
            "message": "Model trained successfully!",
            "model_name": model_name,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "feature_columns": list(X.columns)
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/download_model', methods=['GET'])
@token_required
def download_model(token_data):
    from flask import send_file
    import os
    model_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, 'model.pkl'))
    try:
        return send_file(model_path, as_attachment=True, download_name='model.pkl')
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/download_dataset', methods=['GET'])
@token_required
def download_dataset(token_data):
    from flask import send_file
    import os
    dataset_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, 'dataset.csv'))
    try:
        return send_file(dataset_path, as_attachment=True, download_name='dataset.csv')
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@home_bp.route('/home/mlprocess/predict', methods=['POST'])
@token_required
def predict(token_data):
    try:
        data = request.get_json()
        features = data.get('features', {})
        feature_columns = session.get('feature_columns', [])

        if not feature_columns:
            return jsonify({"error": "No feature columns found in session. Please train the model first."}), 400

        # ✅ Strict feature validation + correct ordering
        input_data = []
        for col in feature_columns:
            if col not in features or str(features[col]).strip() == '':
                return jsonify({"error": f"Missing value for feature: {col}"}), 400
            input_data.append(float(features[col]))

        # ✅ Load model
        model_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, 'model.pkl'))
        if not os.path.exists(model_path):
            return jsonify({"error": "Model file not found. Please train the model first."}), 400

        model = joblib.load(model_path)

        # ✅ Prediction
        prediction = model.predict([input_data])
        pred_val = prediction[0]

        # Convert numpy types safely
        if hasattr(pred_val, 'item'):
            pred_val = pred_val.item()

        # Classification formatting
        is_classification = session.get('ml_type') == 'classification'
        if is_classification:
            pred_val = int(pred_val)

        return jsonify({
            "prediction": pred_val,
            "is_classification": is_classification
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
