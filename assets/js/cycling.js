import moment from 'moment';
import { Chart, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

class Activity {
  constructor(date, time, distance, elevation) {
    this.date = moment(date);
    this.time = moment(time);
    this.distance = distance;
    this.elevation = elevation;
  }

  round(value) {
    return Math.round(value * 10) / 10;
  }

  get displayTime() {
    // Workaround to show more than 23 hours
    const basis = moment().startOf('day').add(this.time, 'seconds');
    const hours = Math.trunc(this.time / 3600);

    return basis.format(`${hours}:mm:ss`);
  }

  get displayDistance() {
    return `${this.round(this.distance)} km`;
  }

  get displayAverage() {
    const hours = this.time / 3600;

    return `${this.round(this.distance / hours)} km/h`;
  }

  get displayElevation() {
    return `${this.round(this.elevation)} m`;
  }

  get titleDay() {
    return this.date.format('MMM D, H:mm');
  }

  get titleWeek() {
    return `${this.date.startOf('week').format('MMM D')} - ${this.date.endOf('week').format('MMM D')}`;
  }

  get titleMonth() {
    return this.date.format('MMMM');
  }
}

class Activities extends Array {
  async fetch(url) {
    return new Promise(resolve => {
      const request = new XMLHttpRequest();

      var enumerateDaysBetweenDates = function(startDate, endDate) {
        var dates = [];

        var currDate = moment(startDate).startOf('day');
        var lastDate = moment(endDate).startOf('day');

        while(currDate.add(1, 'days').diff(lastDate) < 0) {
            dates.push(currDate.clone().toDate());
        }

        return dates;
      };

      request.open('GET', url);
      request.responseType = 'json';
      request.onload = () => {
        for (const datum of request.response) {
          if (datum.type !== 'Ride') {
            continue;
          }

          this.push(new Activity(
            datum.date,
            datum.time,
            datum.distance / 1000,
            datum.elevation
          ));
        }

        for (const date of enumerateDaysBetweenDates(this[this.length - 1].date, this[0].date)) {
          this.push(new Activity(date, 0, 0, 0));
        }

        this.sort((a, b) => {
          return moment.utc(a.date).diff(moment.utc(b.date))
        });

        resolve(this);
      }
      request.send();
    });
  }

  groupBy(keyCallback, dateCallback) {
    const grouped = new Map();
    for (const activity of this) {
      const key = keyCallback(activity);

      if (!grouped.has(key)) {
        grouped.set(key, new Activity(
          dateCallback(activity), 0, 0, 0
        ));
      }

      const value = grouped.get(key);
      value.time += activity.time;
      value.distance += activity.distance;
      value.elevation += activity.elevation;
    }
    return Array.from(grouped.values());
  }

  groupByDay() {
    return this.groupBy(
      activity => activity.date.format('Y-w-D'),
      activity => activity.date.clone());
  }

  groupByWeek() {
    return this.groupBy(
      activity => activity.date.format('Y-w'),
      activity => activity.date.clone().endOf('week'));
  }

  groupByMonth() {
    return this.groupBy(
      activity => activity.date.format('Y-M'),
      activity => activity.date.clone().endOf('month')
    );
  }
}

const data = {
  labels: [],
  datasets: [{
    label: 'My First Dataset',
    data: [],
    backgroundColor: [
      '#5bb1f6',
      '#2196f3',
    ],
    categoryPercentage: 1,
    barPercentage: 1,
  }]
};

const config = {
  type: 'bar',
  data: data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  },
};

async function init() {
  const activities = new Activities();
  await activities.fetch('/static/data/strava.json');

  const labels = [];
  const values = [];
  for (const activity of activities.groupByWeek()) {
    labels.push(activity.titleDay);
    values.push(activity.distance);
  }

  data.labels = labels;
  data.datasets[0].data = values;

  var myBarChart = new Chart(document.getElementById('chart').getContext('2d'), config);
}

init();
