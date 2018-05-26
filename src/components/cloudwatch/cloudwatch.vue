<template>
  <div>
    <b-card bg-variant="light">
      <b-form @submit="onSubmit">
        <b-form-group horizontal breakpoint="lg" label="AWS Config" label-size="lg" label-class="font-weight-bold pt-0" class="mb-0" />
        <b-form-group label="Access Key" >
          <b-form-input type="text" v-model="form.accessKey" required placeholder="Enter your access key">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Secret Access Key" >
          <b-form-input type="password" v-model="form.secretAccessKey" required placeholder="Enter your secret access key">
          </b-form-input>
        </b-form-group>
        <b-form-group label="AWS Region" >
          <b-form-input type="text" v-model="form.region" required placeholder="Enter your aws region">
          </b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Get Metrics List</b-button>
      </b-form>
    </b-card>
    <b-card bg-variant="light">
      <b-button-toolbar>
        <b-input-group size="sm" class="w-25 mx-0" prepend="NameSpace">
          <b-form-select v-bind:disabled="showMetricSpace" v-model="nameSpace" value="" :options="nameSpaces" @change="onChangeNameSpace" />
        </b-input-group>
        <b-input-group size="sm" class="w-25 mx-0" prepend="Metric">
          <b-form-select v-bind:disabled="showMetricName" v-model="metricName" value="" :options="metricNames" @change="onChangeMetricName" />
        </b-input-group>
        <b-input-group size="sm" class="w-50 mx-0" prepend="Dimension">
          <b-form-select v-bind:disabled="showDimension" v-model="dimension" value="" :options="dimensions" @change="onChangeDimension" />
        </b-input-group>
      </b-button-toolbar>
    </b-card>
    <b-alert variant="danger" dismissible :show="showAlertMessage" @dismissed="showAlertMessage=false">
      {{ alertMessage }}
    </b-alert>
    <b-alert variant="warning" dismissible :show="showWarningMessage" @dismissed="showWarningMessage=false">
      {{ warningMessage }}
    </b-alert>
    <div id="chart" style="width:100%;height:100%"></div>
  </div>
</template>

<script lang="ts" src="./cloudwatch.ts"></script>
