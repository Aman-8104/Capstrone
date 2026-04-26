"""
SmartSurplus ML - Distance Calculator
Uses the Haversine formula to calculate the great-circle distance
between two geographic coordinates (in kilometers).
"""
import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two lat/lon points using the Haversine formula.

    Args:
        lat1, lon1: Latitude and longitude of point 1 (decimal degrees)
        lat2, lon2: Latitude and longitude of point 2 (decimal degrees)

    Returns:
        Distance in kilometers (rounded to 2 decimal places).
    """
    R = 6371.0  # Earth's mean radius in km

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(R * c, 2)
