import xgboost as xgb
import pandas as pd

from database.db import get_connection

#loading xgboost model
MODEL_PATH = "freight_xgboost_model.json"
model = xgb.XGBRegressor()
model.load_model(MODEL_PATH)

print("XGBoost model loaded successfully!")

# get historic freight rates
def get_freight_history(origin_port, destination_port, vessel_class):

    connection = get_connection()
    cursor = connection.cursor()
    query = """
        SELECT
            date,
            freight_rate_usd_per_ton
        FROM dry_bulk_freight_rates
        WHERE origin_port = %s
          AND destination_port = %s
          AND vessel_class = %s
        ORDER BY date;
    """
    cursor.execute(
        query,
        (origin_port, destination_port, vessel_class)
    )
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return rows

#create ML features
def create_features(rows):
    df = pd.DataFrame(
        rows,
        columns=["date", "freight_rate_usd_per_ton"]
    )
    df["date"] = pd.to_datetime(df["date"])
    df["freight_rate_usd_per_ton"] = pd.to_numeric(
        df["freight_rate_usd_per_ton"]
    )
    df = df.sort_values("date").reset_index(drop=True)
    g = df["freight_rate_usd_per_ton"]
    df["rate_lag1"] = g.shift(1)
    df["rate_lag7"] = g.shift(7)
    df["rate_lag30"] = g.shift(30)
    df["rolling_mean_7"] = (
        g.shift(1)
         .rolling(7)
         .mean()
    )
    df["rolling_std_7"] = (
        g.shift(1)
         .rolling(7)
         .std()
    )
    df["rolling_mean_30"] = (
        g.shift(1)
         .rolling(30)
         .mean()
    )
    df["pct_change_1"] = g.pct_change(1)
    df["pct_change_7"] = g.pct_change(7)
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    return df

#predict next freight rate
def predict_next_freight_rate(
    origin_port,
    destination_port,
    vessel_class
):
    rows = get_freight_history(
        origin_port,
        destination_port,
        vessel_class
    )
    if len(rows) < 31:
        raise ValueError(
            "Not enough historical data to create ML features."
        )
    df = create_features(rows)
    feature_columns = [
        "rate_lag1",
        "rate_lag7",
        "rate_lag30",
        "rolling_mean_7",
        "rolling_std_7",
        "rolling_mean_30",
        "pct_change_1",
        "pct_change_7",
        "day_of_week",
        "month"
    ]

    # Last historical observation = information available
    # for predicting the next freight rate
    latest_features = df[feature_columns].iloc[[-1]]

    prediction = model.predict(latest_features)

    return float(prediction[0])


# --------------------------------
# 5. Test
# --------------------------------

predicted_rate = predict_next_freight_rate(
    "Port Hedland",
    "Paradip",
    "Capesize"
)

print("Predicted next freight rate:", predicted_rate)