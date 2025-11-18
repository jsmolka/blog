import argparse
import fitparse
import glob
import io
import json
import matplotlib.pyplot as plt
import numpy as np
import os
import xml.etree.ElementTree as ET
from dateutil.relativedelta import relativedelta
from dateutil.parser import parse
from datetime import datetime, timezone


plt.rcParams["font.family"] = "Inter"


def main(args):
    activities = parse_activities(args.path)
    analyze(activities)

    grouped_activities = group_activities(activities)
    plot_distance(grouped_activities)
    plot_average_watts(grouped_activities)
    plot_average_normalized_watts(grouped_activities)
    plot_average_heartrate(grouped_activities)
    plot_efficiency_factor(grouped_activities)
    plot_calories(grouped_activities)


def calculate_calories(average_watts, hours):
    return 3.6 * average_watts * hours


def calculate_normalized_power(power_data):
    # Need at least 30 seconds
    if len(power_data) < 30:
        return None

    power_data = np.array(power_data, dtype=np.float64)
    # Create 30 second rolling average
    rolling_average = np.convolve(power_data, np.ones(30) / 30, mode="valid")
    # Raise values to 4th power
    rolling_average_4th = rolling_average**4
    # Average values
    mean_4th = np.mean(rolling_average_4th)
    # Take 4th root
    return mean_4th**0.25


def parse_power_data_fit(fit_path):
    fit = fitparse.FitFile(fit_path)
    power_data = []
    for record in fit.get_messages("record"):
        for data in record:
            if data.name == "power" and data.value is not None:
                power_data.append(data.value)
    return power_data


def parse_power_data_tcx(tcx_path):
    # Workaround for leading whitespace
    with open(tcx_path, "r") as tcx_file:
        content = tcx_file.read().lstrip()

    tree = ET.parse(io.StringIO(content))
    ns_tcx = {"tcx": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"}
    ns_ns3 = {"ns3": "http://www.garmin.com/xmlschemas/ActivityExtension/v2"}

    power_data = []
    for trackpoint in tree.getroot().findall(".//tcx:Trackpoint", ns_tcx):
        extension = trackpoint.find("tcx:Extensions", ns_tcx)
        if extension is None:
            continue

        watts = extension.find(".//ns3:Watts", ns_ns3)
        if watts is not None:
            power_data.append(int(watts.text))
    return power_data


def get_normalized_power(meta_path):
    base_path = meta_path.rstrip(".meta.json")

    for extension, parse_power_data in {
        "fit": parse_power_data_fit,
        "tcx": parse_power_data_tcx,
    }.items():
        file_path = f"{base_path}.{extension}"
        if os.path.exists(file_path):
            return calculate_normalized_power(parse_power_data(file_path))

    return None


def parse_activities(path):
    activities = []
    for meta_path in glob.iglob(os.path.join(path, "**/*.meta.json"), recursive=True):
        with open(meta_path, mode="r") as meta_file:
            activity = json.load(meta_file)
            if activity["type"] != "Ride":
                continue

            activity["distance"] /= 1000  # Convert meters to kilometers
            activity["moving_time"] /= 60 * 60  # Convert seconds to hours
            activity["elapsed_time"] /= 60 * 60  # Convert seconds to hours
            activity["start_date"] = parse(activity["start_date"])
            activity["normalized_watts"] = (
                get_normalized_power(meta_path) if activity["device_watts"] else None
            )
            activities.append(activity)

    activities.sort(key=lambda activity: activity["start_date"])

    return activities


def group_activities(activities):
    activities = activities[:]

    threshold = datetime(
        activities[0]["start_date"].year,
        activities[0]["start_date"].month,
        1,
        tzinfo=timezone.utc,
    )

    groups = {}
    while activities:
        key = threshold.strftime("%b %Y")
        groups[key] = []
        threshold += relativedelta(months=1)
        while activities and activities[0]["start_date"] < threshold:
            groups[key].append(activities.pop(0))
    return groups


NO_POWER_WATTS = 210


def analyze(activities):
    distance = 0
    moving_time = 0
    elapsed_time = 0
    indoor_distance = 0
    indoor_time = 0
    outdoor_distance = 0
    outdoor_time = 0
    watts = 0
    watts_time = 0
    normalized_watts = 0
    normalized_watts_time = 0
    heartrate = 0
    heartrate_time = 0
    no_power_distance = 0
    no_power_time = 0
    no_power_calories = 0
    power_distance = 0
    power_time = 0
    power_calories = 0
    for activity in activities:
        distance += activity["distance"]
        moving_time += activity["moving_time"]
        elapsed_time += activity["elapsed_time"]

        if activity["trainer"]:
            indoor_distance += activity["distance"]
            indoor_time += activity["moving_time"]
        else:
            outdoor_distance += activity["distance"]
            outdoor_time += activity["moving_time"]

        if activity["device_watts"]:
            watts += activity["average_watts"] * activity["moving_time"]
            watts_time += activity["moving_time"]

        if activity["normalized_watts"] is not None:
            normalized_watts += activity["normalized_watts"] * activity["moving_time"]
            normalized_watts_time += activity["moving_time"]

        if activity["has_heartrate"]:
            heartrate += activity["average_heartrate"] * activity["moving_time"]
            heartrate_time += activity["moving_time"]

        if activity["device_watts"]:
            power_distance += activity["distance"]
            power_time += activity["moving_time"]
            power_calories += calculate_calories(
                activity["average_watts"], activity["moving_time"]
            )
        else:
            no_power_distance += activity["distance"]
            no_power_time += activity["moving_time"]
            no_power_calories += calculate_calories(
                NO_POWER_WATTS, activity["moving_time"]
            )

    print(f"Rides: {len(activities)}")
    print(f"Distance: {distance} km")
    print(f"Average distance: {distance / len(activities)} km")
    print(f"Moving time: {moving_time} h")
    print(f"Elapsed time: {elapsed_time} h")
    print(f"Average speed: {distance / moving_time} km/h")
    print(f"Indoor distance: {indoor_distance} km")
    print(f"Indoor time: {indoor_time} h")
    print(f"Outdoor distance: {outdoor_distance} km")
    print(f"Outdoor time: {outdoor_time} h")
    print(f"Average watts: {watts / watts_time} W")
    print(f"Average normalized watts: {normalized_watts / normalized_watts_time} W")
    print(f"Average heartrate: {heartrate / heartrate_time} bpm")
    print(f"No power distance: {no_power_distance} km")
    print(f"No power time: {no_power_time} h")
    print(f"No power calories: {no_power_calories} kcal")
    print(f"Power distance: {power_distance} km")
    print(f"Power time: {power_time} h")
    print(f"Power calories: {power_calories} kcal")
    print(f"Calories: {no_power_calories + power_calories} kcal")


PLOT_SIZE = (19.2, 10.8)
PLOT_DPI = 100
COLOR_SHADE_1 = "#ebedf2"
COLOR_BRAND_3 = "#608fb3"
COLOR_GREEN = "#a3be8c"


def set_plot_axes_style(axes):
    for spine in axes.spines.values():
        spine.set_edgecolor(COLOR_SHADE_1)

    for i, label in enumerate(axes.get_xticklabels()):
        label.set_rotation(45)
        label.set_horizontalalignment("right")
        label.set_visible(i % 2 != 0)

    axes.tick_params(colors=COLOR_SHADE_1, length=8, labelsize=24)


def plot_distance(grouped_activities):
    values = {
        "indoor": np.zeros(len(grouped_activities)),
        "outdoor": np.zeros(len(grouped_activities)),
    }
    for i, activities in enumerate(grouped_activities.values()):
        for activity in activities:
            key = "indoor" if activity["trainer"] else "outdoor"
            values[key][i] += activity["distance"]

    _, axes = plt.subplots(figsize=PLOT_SIZE)

    for i, label in enumerate(grouped_activities.keys()):
        indoor = values["indoor"][i]
        axes.bar(label, indoor, 0.5, bottom=0, color=COLOR_GREEN)
        axes.bar(label, values["outdoor"][i], 0.5, bottom=indoor, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)

    plt.tight_layout()
    plt.savefig("../img/distance.png", dpi=PLOT_DPI, transparent=True)


def plot_average_watts(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        watts_time = 0
        for activity in activities:
            if activity["device_watts"]:
                values[i] += activity["average_watts"] * activity["moving_time"]
                watts_time += activity["moving_time"]
        if watts_time > 0:
            values[i] /= watts_time

    _, axes = plt.subplots(figsize=PLOT_SIZE)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)
    axes.set_ylim(bottom=100)

    plt.tight_layout()
    plt.savefig("../img/watts.png", dpi=PLOT_DPI, transparent=True)


def plot_average_normalized_watts(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        normalized_watts_time = 0
        for activity in activities:
            if activity["normalized_watts"] is not None:
                values[i] += activity["normalized_watts"] * activity["moving_time"]
                normalized_watts_time += activity["moving_time"]
        if normalized_watts_time > 0:
            values[i] /= normalized_watts_time

    _, axes = plt.subplots(figsize=PLOT_SIZE)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)
    axes.set_ylim(bottom=100)

    plt.tight_layout()
    plt.savefig("../img/normalized-watts.png", dpi=PLOT_DPI, transparent=True)


def plot_average_heartrate(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        heartrate_time = 0
        for activity in activities:
            if activity["has_heartrate"]:
                values[i] += activity["average_heartrate"] * activity["moving_time"]
                heartrate_time += activity["moving_time"]
        if heartrate_time > 0:
            values[i] /= heartrate_time

    _, axes = plt.subplots(figsize=PLOT_SIZE)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)
    axes.set_ylim(bottom=100)

    plt.tight_layout()
    plt.savefig("../img/heartrate.png", dpi=PLOT_DPI, transparent=True)


def plot_efficiency_factor(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        efficiency_factor_time = 0
        for activity in activities:
            if activity["normalized_watts"] is not None and activity["has_heartrate"]:
                values[i] += (
                    activity["normalized_watts"] / activity["average_heartrate"]
                ) * activity["moving_time"]
                efficiency_factor_time += activity["moving_time"]
        if efficiency_factor_time > 0:
            values[i] /= efficiency_factor_time

    _, axes = plt.subplots(figsize=PLOT_SIZE)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)
    axes.set_ylim(bottom=1)

    plt.tight_layout()
    plt.savefig("../img/efficiency-factor.png", dpi=PLOT_DPI, transparent=True)


def plot_calories(grouped_activities):
    values = {
        "no_power": np.zeros(len(grouped_activities)),
        "power": np.zeros(len(grouped_activities)),
    }
    for i, activities in enumerate(grouped_activities.values()):
        for activity in activities:
            key = "power" if activity["device_watts"] else "no_power"
            average_watts = (
                activity["average_watts"]
                if activity["device_watts"]
                else NO_POWER_WATTS
            )
            values[key][i] += calculate_calories(average_watts, activity["moving_time"])

    _, axes = plt.subplots(figsize=PLOT_SIZE)

    for i, label in enumerate(grouped_activities.keys()):
        no_power = values["no_power"][i]
        axes.bar(label, no_power, 0.5, bottom=0, color=COLOR_GREEN)
        axes.bar(label, values["power"][i], 0.5, bottom=no_power, color=COLOR_BRAND_3)

    set_plot_axes_style(axes)

    plt.tight_layout()
    plt.savefig("../img/calories.png", dpi=PLOT_DPI, transparent=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-p", dest="path", type=str, help="Activities path", required=True
    )
    main(parser.parse_args())
