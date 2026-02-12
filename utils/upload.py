import pandas as pd
from tkinter import filedialog
import customtkinter as ctk

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

def upload_dataset(preview_rows=100):

    file_path = filedialog.askopenfilename(
        title="Select Dataset",
        filetypes=[
            ("CSV files", "*.csv"),
            ("Excel files", "*.xlsx *.xls *.xlsm")
        ]
    )

    if not file_path:
        return None

    try:

        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path, nrows=preview_rows)
        else:
            df = pd.read_excel(file_path, nrows=preview_rows)

        # Memory optimization
        df = df.convert_dtypes()

        return df

    except Exception as e:
        print(f"Dataset loading failed: {e}")
        return None


if __name__ == "__main__":
    root = ctk.CTk()
    root.withdraw()  
    upload_dataset()
    root.mainloop()
