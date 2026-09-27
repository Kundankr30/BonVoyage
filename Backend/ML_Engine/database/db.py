import psycopg2
import os

def get_connection():
    # Use environment variable if set, otherwise default to Prisma's format parsed
    database_url = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/sih")
    # psycopg2 can connect using a connection string directly!
    connection = psycopg2.connect(database_url)
    return connection
def get_shipment(shipment_id):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT
            shipment_id,
            origin_port_id,
            destination_port_id,
            commodity,
            cargo_quantity_tons,
            earliest_charter_date,
            required_arrival_date,
            preferred_vessel_class
        FROM shipments
        WHERE shipment_id = %s;
    """

    cursor.execute(query, (shipment_id,))
    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return None

    return {
        "shipment_id": row[0],
        "origin_port_id": row[1],
        "destination_port_id": row[2],
        "commodity": row[3],
        "cargo_quantity_tons": row[4],
        "earliest_charter_date": row[5],
        "required_arrival_date": row[6],
        "preferred_vessel_class": row[7]
    }

def get_vessels(vessel_class):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT
            vessel_id,
            vessel_name,
            vessel_type,
            dwt,
            loa_m,
            beam_m,
            draft_m,
            fuel_consumption_tpd,
            speed_knots,
            availability_status
        FROM vessels
        WHERE vessel_type = %s;
    """

    cursor.execute(query, (vessel_class,))
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    columns = [
        "vessel_id",
        "vessel_name",
        "vessel_type",
        "dwt",
        "loa_m",
        "beam_m",
        "draft_m",
        "fuel_consumption_tpd",
        "speed_knots",
        "availability_status"
    ]

    vessels = []

    for row in rows:
        vessels.append(dict(zip(columns, row)))

    return vessels

def get_port(port_id):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT
            port_id,
            port_name,
            latitude,
            longitude,
            max_draft_m,
            max_loa_m,
            max_beam_m,
            cargo_handling_rate_tpd,
            avg_waiting_time_hrs,
            congestion_index,
            berth_availability_pct
        FROM ports
        WHERE port_id = %s;
    """

    cursor.execute(query, (port_id,))
    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return None

    return {
        "port_id": row[0],
        "port_name": row[1],
        "latitude": float(row[2]) if row[2] else 0,
        "longitude": float(row[3]) if row[3] else 0,
        "max_draft_m": float(row[4]) if row[4] else 0,
        "max_loa_m": float(row[5]) if row[5] else 0,
        "max_beam_m": float(row[6]) if row[6] else 0,
        "cargo_handling_rate_tpd": float(row[7]) if row[5] else 0,
        "avg_waiting_time_hrs": float(row[8]) if row[6] else 0,
        "congestion_index": float(row[9]) if row[7] else 0,
        "berth_availability_pct": float(row[10]) if row[8] else 0
    }

def get_bunker_price(origin_port_id, destination_port_id, fuel_type, date):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT price_usd_per_ton
        FROM bunker_prices
        WHERE port_id = %s AND fuel_type = %s
        ORDER BY date DESC
        LIMIT 1;
    """

    cursor.execute(query, (origin_port_id, fuel_type))
    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return 500.0  # Fallback

    return float(row[0])

def get_weather(port_id, date):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT wind_speed_knots, wave_height_m, visibility_nm, condition, storm_warning
        FROM weather
        WHERE port_id = %s AND date = %s;
    """

    cursor.execute(query, (port_id, date))
    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return {
            "wind_speed_knots": 10.0,
            "wave_height_m": 1.0,
            "visibility_nm": 10.0,
            "condition": "Clear",
            "storm_warning": False
        }

    return {
        "wind_speed_knots": float(row[0]) if row[0] else 10.0,
        "wave_height_m": float(row[1]) if row[1] else 1.0,
        "visibility_nm": float(row[2]) if row[2] else 10.0,
        "condition": str(row[3]) if row[3] else "Clear",
        "storm_warning": bool(row[4])
    }

def get_latest_freight_rate(origin_port, destination_port, vessel_class):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT freight_rate_usd_per_ton
        FROM dry_bulk_freight_rates
        WHERE origin_port = %s
          AND destination_port = %s
          AND vessel_class = %s
        ORDER BY date DESC
        LIMIT 1;
    """

    cursor.execute(query, (origin_port, destination_port, vessel_class))
    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return 15.0  # Fallback

    return float(row[0])

def save_optimization_result(shipment_id, vessel_id, route_code, recommended_charter_date, predicted_freight_rate, freight_cost, fuel_cost, port_cost, demurrage_cost, total_cost, risk_score, recommendation_reason):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO optimization_results (
            shipment_id,
            vessel_id,
            route_code,
            recommended_charter_date,
            predicted_freight_rate_usd_per_ton,
            freight_cost_usd,
            fuel_cost_usd,
            port_cost_usd,
            demurrage_cost_usd,
            total_cost_usd,
            risk_score,
            recommendation_reason
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING result_id;
    """

    values = (
        shipment_id,
        vessel_id,
        route_code,
        recommended_charter_date,
        predicted_freight_rate,
        freight_cost,
        fuel_cost,
        port_cost,
        demurrage_cost,
        total_cost,
        risk_score,
        recommendation_reason
    )

    cursor.execute(query, values)
    result_id = cursor.fetchone()[0]
    
    connection.commit()
    cursor.close()
    connection.close()

    return result_id
