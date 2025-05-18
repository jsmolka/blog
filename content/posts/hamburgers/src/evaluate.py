import argparse
import dateutil.parser
import glob
import json
import matplotlib.pyplot as plt
import numpy as np
import os
from dateutil.relativedelta import relativedelta
from datetime import datetime, timezone


plt.rcParams["font.family"] = "Inter"


def main(args):
    activities = parse_activities(args.path)
    analyse_general(activities)
    analyse_power_calories(activities)
    analyse_indoor(activities)

    grouped_activities = group_activities(activities)
    analyse_distance(grouped_activities)
    analyse_average_watts(grouped_activities)
    analyse_average_heartrate(grouped_activities)


def parse_activities(path):
    activities = []
    for meta_path in glob.iglob(os.path.join(path, "**/*.meta.json"), recursive=True):
        with open(meta_path, mode="r") as meta_file:
            activity = json.load(meta_file)
            if activity["type"] == "Ride":
                activity["distance"] /= 1000  # Convert meters to kilometers
                activity["moving_time"] /= 60 * 60  # Convert seconds to hours
                activity["elapsed_time"] /= 60 * 60  # Convert seconds to hours
                activity["start_date"] = dateutil.parser.isoparse(
                    activity["start_date"]
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


def analyse_general(activities):
    distance = 0
    moving_time = 0
    elapsed_time = 0
    average_watts = 0
    average_watts_time = 0
    average_heartrate = 0
    average_heartrate_time = 0
    for activity in activities:
        distance += activity["distance"]
        moving_time += activity["moving_time"]
        elapsed_time += activity["elapsed_time"]
        if activity["device_watts"]:
            average_watts += activity["average_watts"] * activity["moving_time"]
            average_watts_time += activity["moving_time"]
        if activity["has_heartrate"]:
            average_heartrate += activity["average_heartrate"] * activity["moving_time"]
            average_heartrate_time += activity["moving_time"]

    print(f"Distance: {distance} km")
    print(f"Moving time: {moving_time} h")
    print(f"Elapsed time: {elapsed_time} h")
    print(f"Average watts: {average_watts / average_watts_time} W")
    print(f"Average heartrate: {average_heartrate / average_heartrate_time} bpm")


def analyse_power_calories(activities):
    power_distance = 0
    power_time = 0
    power_calories = 0
    for activity in activities:
        if activity["device_watts"]:
            power_distance += activity["distance"]
            power_time += activity["moving_time"]
            power_calories += activity["average_watts"] * 3.6 * activity["moving_time"]

    print(f"Distance with power data: {power_distance} km")
    print(f"Time with power data: {power_time} h")
    print(f"Calories: {power_calories} kcal")


def analyse_indoor(activities):
    indoor_distance = 0
    indoor_time = 0
    for activity in activities:
        if activity["trainer"]:
            indoor_distance += activity["distance"]
            indoor_time += activity["moving_time"]

    print(f"Indoor distance: {indoor_distance} km")
    print(f"Indoor time: {indoor_time} h")


plot_size = (19.2, 10.8)
plot_dpi = 100
color_shade_1 = "#ebedf2"
color_brand_3 = "#608fb3"
color_green = "#a3be8c"


def set_axes_style(axes):
    for spine in axes.spines.values():
        spine.set_edgecolor(color_shade_1)

    for i, label in enumerate(axes.get_xticklabels()):
        label.set_rotation(45)
        label.set_horizontalalignment("right")
        label.set_visible(i % 2 != 0)

    axes.tick_params(colors=color_shade_1, length=8, labelsize=24)


def analyse_distance(grouped_activities):
    values = {
        "indoor": np.zeros(len(grouped_activities)),
        "outdoor": np.zeros(len(grouped_activities)),
    }
    for i, activities in enumerate(grouped_activities.values()):
        for activity in activities:
            key = "indoor" if activity["trainer"] else "outdoor"
            values[key][i] += activity["distance"]

    _, axes = plt.subplots(figsize=plot_size)

    for i, label in enumerate(grouped_activities.keys()):
        indoor = values["indoor"][i]
        axes.bar(label, indoor, 0.5, bottom=0, color=color_green)
        axes.bar(label, values["outdoor"][i], 0.5, bottom=indoor, color=color_brand_3)

    set_axes_style(axes)

    plt.tight_layout()
    plt.savefig("../img/distance.png", dpi=plot_dpi, transparent=True)


def analyse_average_watts(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        average_watts_time = 0
        for activity in activities:
            if activity["device_watts"]:
                values[i] += activity["average_watts"] * activity["moving_time"]
                average_watts_time += activity["moving_time"]
        if average_watts_time > 0:
            values[i] /= average_watts_time

    _, axes = plt.subplots(figsize=plot_size)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=color_brand_3)

    set_axes_style(axes)

    plt.tight_layout()
    plt.savefig("../img/watts.png", dpi=plot_dpi, transparent=True)


def analyse_average_heartrate(grouped_activities):
    values = np.zeros(len(grouped_activities))
    for i, activities in enumerate(grouped_activities.values()):
        average_heartrate_time = 0
        for activity in activities:
            if activity["has_heartrate"]:
                values[i] += activity["average_heartrate"] * activity["moving_time"]
                average_heartrate_time += activity["moving_time"]
        if average_heartrate_time > 0:
            values[i] /= average_heartrate_time

    _, axes = plt.subplots(figsize=plot_size)
    for i, label in enumerate(grouped_activities.keys()):
        axes.bar(label, values[i], 0.5, bottom=0, color=color_brand_3)

    set_axes_style(axes)

    plt.tight_layout()
    plt.savefig("../img/heartrate.png", dpi=plot_dpi, transparent=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-p", dest="path", type=str, help="Activities path", required=True
    )
    main(parser.parse_args())
