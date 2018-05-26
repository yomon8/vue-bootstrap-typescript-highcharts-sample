import AWS, { CloudWatch, ServerlessApplicationRepository } from "aws-sdk";
import * as Highcharts from 'highcharts';
import * as Exporting from 'highcharts/modules/exporting';
import * as ExportingData from 'highcharts/modules/export-data';
Exporting(Highcharts);
ExportingData(Highcharts);
import Vue from "vue";

let metricData: CloudWatch.Types.ListMetricsOutput = null;
let cw: AWS.CloudWatch = null;

let chartStart: number;
let chartEnd: number;

export default Vue.extend({
  name: "cloudwatch",
  data() {
    return {
      form: {
        accessKey: "",
        secretAccessKey: "",
        region: "ap-northeast-1"
      },
      alertMessage: "",
      warningMessage: "",
      showAlertMessage: false,
      showWarningMessage: false,
      nameSpace: "",
      nameSpaces: [],
      metricName: "",
      metricNames: [],
      dimension: "",
      dimensions: [],
      showMetricSpace: true,
      showMetricName: true,
      showDimension: true,
      chart: null as Highcharts.ChartObject
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      AWS.config.update({
        region: this.form.region,
        accessKeyId: this.form.accessKey,
        secretAccessKey: this.form.secretAccessKey
      });
      cw = new AWS.CloudWatch();
      cw.listMetrics({}, (err, data) => {
        if (err) {
          this.alertMessage = err.message;
          this.showAlertMessage = true;
          return;
        } else {
          metricData = data;
        }
        this.nameSpaces = metricData.Metrics.map(x => x.Namespace).filter(
          (x, i, self) => self.indexOf(x) === i
        );
        this.showMetricSpace = false;
      });
    },

    onChangeNameSpace(ev) {
      this.metricNames = metricData.Metrics.filter(x => x.Namespace === ev)
        .map(x => x.MetricName)
        .filter((x, i, self) => self.indexOf(x) === i);
      this.showMetricName = false;
      this.showDimension = true;
      this.dimension = "";
    },

    onChangeMetricName(ev: string) {
      this.dimension = "";
      this.dimensions = metricData.Metrics.filter(x => {
        return this.nameSpace === x.Namespace;
      })
        .map(x => JSON.stringify(x.Dimensions))
        .filter((x, i, self) => self.indexOf(x) === i);
      this.showDimension = false;
    },

    onChangeDimension(ev: string) {
      if (this.chart === null) {
        this.initChart();
      }
      let cwParams = {
        StartTime: new Date(chartStart),
        EndTime: new Date(chartEnd),
        Period: 60,
        Statistics: ["Average"],
        Namespace: this.nameSpace,
        MetricName: this.metricName,
        Dimensions: JSON.parse(ev)
      } as AWS.CloudWatch.Types.GetMetricStatisticsInput;

      cw.getMetricStatistics(cwParams, (err, data) => {
        if (data.Datapoints.length === 0) {
          this.warningMessage = "No metric data found";
          this.showWarningMessage = true;
          return;
        }
        if (err) {
          this.alertMessage = err.message;
          this.showAlertMessage = true;
          return;
        } else {
          let chartData = this.getChartDatapoint(
            chartStart,
            chartEnd,
            data.Datapoints
          );
          this.chart.addSeries({
            name:
              this.metricName +
              "-" +
              cwParams.Dimensions.map(x => x.Name + "_" + x.Value).join("-"),
            data: chartData
          });
        }
      });
    },

    getChartDatapoint(
      s: number,
      e: number,
      datapoints: AWS.CloudWatch.Types.Datapoint[]
    ): number[] {
      let sorted = datapoints.sort(
        (a, b) => a.Timestamp.getTime() - b.Timestamp.getTime()
      );
      let data = [] as number[];
      for (let i = s, j = 0; i <= e; i = i + 60 * 1000) {
        if (j < sorted.length && i === sorted[j].Timestamp.getTime()) {
          data.push(sorted[j].Average);
          j++;
          continue;
        }
        data.push(null);
      }
      return data;
    },

    initChart() {
      let truncateUnderSec = (t: Date): Date => {
        t.setSeconds(0);
        t.setMilliseconds(0);
        return t;
      };
      let end = truncateUnderSec(new Date());
      chartEnd = end.getTime();
      let start = truncateUnderSec(new Date());
      start.setHours(start.getHours() - 24);
      chartStart = start.getTime();

      this.chart = Highcharts.chart("chart", {
        chart: {
          height: 400
        },
        title: {
          text: start.toUTCString() + "   〜   " + end.toUTCString()
        },
        xAxis: {
          type: "datetime"
        },
        legend: {
          layout: "vertical",
          align: "center",
          verticalAlign: "bottom"
        },
        plotOptions: {
          series: {
            connectNulls: true,
            pointInterval: 60 * 1000,
            pointStart: start.getTime()
          }
        }
      });
    }
  }
});
