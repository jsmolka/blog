import api
import json


if __name__ == "__main__":
    activities = []

    page = 0
    while True:
        page += 1
        length = len(activities)
        for activity in api.json(f"/athlete/activities?page={page}"):
            activities.append(activity)
        if length == len(activities):
            break;

    data = []
    for activity in activities:
        datum = dict()
        datum["date"] = activity["start_date"]
        datum["type"] = activity["type"]
        datum["distance"] = activity["distance"]
        datum["time"] = activity["moving_time"]
        datum["elevation"] = activity["total_elevation_gain"]
        data.append(datum)

    with open("strava.json", "w") as outfile:
        outfile.write(json.dumps(data, indent=4))
