from upload import upload_dataset
from data_cleaning import remove_columns, data_cleaning_pipeline
from encoding import check_categorical_columns,encode_categorical_columns,encode_strategy

while True:
    choice = input("1. ML pipeline\n2. Exit\nEnter Choice: ")

    if choice == '1':
        df = upload_dataset()

        if df is None:
            print("No dataset uploaded.")
            continue

        print("Dataset uploaded successfully.")

        while True:
            choice = input(
                "\n1. Display dataset"
                "\n2. Remove columns"
                "\n3. Handle missing values"
                "\n4. Check categorical columns"
                "\nn. Exit"
                "\nEnter Choice: "
            )

            if choice == '1':
                print(df.head())

            elif choice == '2':
                df = remove_columns(df)
                print("Columns removed successfully.")

            elif choice == '3':
                df = data_cleaning_pipeline(df)
                print("Missing values handled successfully.")

            elif choice == '4':
                cat_cols = check_categorical_columns(df)
                print("categorical columns:",cat_cols)
                if cat_cols:
                    stratgy = encode_strategy(df,cat_cols)
                    df = encode_categorical_columns(df,stratgy)


            elif choice == 'n':
                break

            else:
                print("Invalid choice. Please try again.")

    elif choice == '2':
        print("Exiting the program.")
        break

    else:
        print("Invalid choice. Please try again.")
