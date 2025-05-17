import argparse
import glob
import json
import os


def main(args):
    activities = parse_activities(args.path)
    analyse_general(activities)
    analyse_power_calories(activities)
    analyse_indoor(activities)


def parse_activities(path):
    activities = []
    for meta_path in glob.iglob(os.path.join(path, "**/*.meta.json"), recursive=True):
        with open(meta_path, mode="r") as meta_file:
            activity = json.load(meta_file)
            if activity["type"] == "Ride":
                activity["distance"] /= 1000  # Convert meters to kilometers
                activity["moving_time"] /= 60 * 60  # Convert seconds to hours
                activity["elapsed_time"] /= 60 * 60  # Convert seconds to hours
                activities.append(activity)
    return activities


def analyse_general(activities):
    distance = 0
    moving_time = 0
    elapsed_time = 0
    for activity in activities:
        distance += activity["distance"]
        moving_time += activity["moving_time"]
        elapsed_time += activity["elapsed_time"]

    print(f"Distance: {distance} km")
    print(f"Moving time: {moving_time} h")
    print(f"Elapsed time: {elapsed_time} h")


def analyse_power_calories(activities):
    watts_distance = 0
    watts_time = 0
    watts_calories = 0
    for activity in activities:
        if activity["average_watts"] != None:  # Todo: use different key
            watts_distance += activity["distance"]
            watts_time += activity["moving_time"]
            watts_calories += activity["average_watts"] * 3.6 * activity["moving_time"]

    print(f"Distance with power: {watts_distance} km")
    print(f"Time with power: {watts_time} hours")
    print(f"Calories: {watts_calories} kcal")


def analyse_indoor(activities):
    indoor_distance = 0
    indoor_time = 0
    for activity in activities:
        if activity["trainer"]:
            indoor_distance += activity["distance"]
            indoor_time += activity["moving_time"]

    print(f"Indoor distance: {indoor_distance} km")
    print(f"Indoor time: {indoor_time} hours")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", dest="path", type=str, help="Activities path", required=True)
    main(parser.parse_args())
