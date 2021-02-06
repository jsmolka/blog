import moment from 'moment';
import Chart from 'chart.js';

(async function() {
  const config = {
    type: 'line',
    data: {
      datasets: []
    },
    options: {
      legend: {},
      scales: {
        xAxes: [],
        yAxes: [{
          ticks: {
            callback: function(value) {
              return `${value} km`;
            }
          }
        }]
      },
      tooltips: {
        xPadding: 8,
        yPadding: 8,
        bodySpacing: 4,
        cornerRadius: 0,
        displayColors: false,
        callbacks: {
          label: function(item, data) {
            const activity = data.datasets[item.datasetIndex].data[item.index].activity;

            return [
              `Distance: ${activity.displayDistance}`,
              `Moving time: ${activity.displayTime}`,
              `Average speed: ${activity.displayAverage}`,
              `Elevation gain: ${activity.displayElevation}`
            ];
          }
        }
      }
    }
  };

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
        activity => activity.date.clone()
      );
    }

    groupByWeek() {
      return this.groupBy(
        activity => activity.date.format('Y-w'),
        activity => activity.date.clone().endOf('week')
      );
    }

    groupByMonth() {
      return this.groupBy(
        activity => activity.date.format('Y-M'),
        activity => activity.date.clone().endOf('month')
      );
    }
  }

  class Dataset {
    constructor(label, data, hidden) {
      this.label = label;
      this.borderColor = 'rgba(33, 150, 243, 1)';
      this.backgroundColor = 'rgba(33, 150, 243, 0.1)';
      this.borderWidth = 1;
      this.lineTension = 0;
      this.pointRadius = 5;
      this.pointHitRadius = 5;
      this.pointBorderColor = 'rgba(33, 150, 243, 1)';
      this.pointBackgroundColor = 'rgb(233, 245, 254, 1)';
      this.pointHoverRadius = 5;
      this.data = data;
      this.hidden = hidden;
    }
  }

  class Application {
    constructor() {
      this.chart = null;
      this.hidden = new Set();
      this.config = Object.assign({}, config);
      this.activities = new Activities();

      // Cached update values
      this.groupCallback = activities => activities.groupByDay();
      this.titleCallback = activity => activity.titleDay;
      this.unit = 'week';
    }

    async init() {
      await this.activities.fetch('/static/data/strava.json');

      this.config.options.legend.onClick = (event, item) => {
        const year = item.text;
        if (this.hidden.has(year)) {
          this.hidden.delete(year);
        } else {
          this.hidden.add(year);
        }
        this.update();
      }

      this.update();
    }

    update(groupCallback, titleCallback, unit) {
      // Used passed or cached values
      this.groupCallback = groupCallback || this.groupCallback;
      this.titleCallback = titleCallback || this.titleCallback;
      this.unit = unit || this.unit;


      const years = new Map();
      for (const activity of this.groupCallback(this.activities)) {
        const year = activity.date.year();

        if (!years.has(year)) {
          years.set(year, []);
        }

        years.get(year).push({
          x: activity.date,
          y: activity.distance,
          activity: activity
        });
      }

      this.config.options.scales.xAxes.length = 0;
      this.config.options.scales.xAxes.push({
        type: 'time',
        time: {
          unit: this.unit,
          unitStepSize: 1
        }
      });

      this.config.options.tooltips.callbacks.title = (items, data) => {
        return this.titleCallback(data.datasets[items[0].datasetIndex].data[items[0].index].activity);
      };

      let lastDataset = null;

      const sortedYears = new Map([...years.entries()].sort());

      this.config.data.datasets.length = 0;
      for (const [year, data] of sortedYears.entries()) {
        // Connect datasets, first item is latest activity
        if (lastDataset) {
          data.push(lastDataset[0])
        }

        const dataset = new Dataset(year, data, this.hidden.has(year));

        this.config.data.datasets.push(dataset);

        if (!dataset.hidden) {
          lastDataset = data;
        }
      }

      if (this.chart) {
        this.chart.update(this.config);
      } else {
        this.chart = new Chart(document.getElementById('chart').getContext('2d'), this.config);
      }
    }
  }

  moment.updateLocale('de', {
    week: {
      dow: 1  // Because weeks don't start on Sunday...
    }
  });

  const app = new Application();

  await app.init();

  document.getElementById('btnDay').onclick = () => {
    app.update(
      activities => activities.groupByDay(),
      activity => activity.titleDay,
      'week'
    );
  };

  document.getElementById('btnWeek').onclick = () => {
    app.update(
      activities => activities.groupByWeek(),
      activity => activity.titleWeek,
      'week'
    );
  };

  document.getElementById('btnMonth').onclick = () => {
    app.update(
      activities => activities.groupByMonth(),
      activity => activity.titleMonth,
      'month'
    );
  };
})();
