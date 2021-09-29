---
layout: posts
title:  "Google IoT Core with ESP8266: Pub/Sub, Cloud Functions, BigQuery"
date:   2021-08-12
categories: 
    - GCP
    - Programming
toc: true
toc_sticky: true
---

We use Google's IoT Core to build a temperature and humidity monitoring system...for my living room.

## Background

It's 2021. Everything is connected to the internet. Data is collected in a multitude of ways, all of the time. Your fridge just pushed a notification about milk running out.

The Internet of Things (IoT) is a large network of internet-connected devices that possess the capability of gathering and sharing . Year after year the list of *things* that make up this network grows, and now you are able to buy a variety of items with these capabilities. Yes, even a fridge. 

However, on the other end of the spectrum, we've got devices like microcontrollers that are the size of a stick of gum, yet pack a powerful feature set. One of these is the [ESP8266](https://en.wikipedia.org/wiki/ESP8266), which brings Wi-Fi, GPIO pins, I2S/I2C and more in an affordable and pleasant to work with package.

The ESP8266 is also one of Google's recommended chips to get started working with [Cloud IoT Core](https://cloud.google.com/iot-core), which is a managed service to easily connect, secure and manage IoT devices.

Google also recommends a few different kits to get started with IoT workloads, and you can read more about them [here.](https://cloud.google.com/solutions/iot/kit/)

## Getting the ESP8266 ready

### Operating System

Computers require operating systems. The same applies to our ESP8266 board, and thus we'll be using [Mongoose OS](https://mongoose-os.com/) to get things started in a matter of minutes. Mongoose OS (mos) allows for higher-level programing languages (like JavaScript) to be used when writing programs for a chips like the one we're using. C and C++ are languages often used for this type of work, but I much prefer going with mos and JS.


### Sensor

We'll use a DHT22 sensor which is capable of measuring temperature and humidity. The DHT22 usually comes with three or four pins. Mine has three (VCC, Data, and Ground). We'll connect the ESP to the sensor in the following manner:

- Ground on the ESP to ground on the DHT22.
- GPIO pin D7 on the ESP to the data on the DHT22.
- The 3.3V pin on the ESP to the VCC pin on the DHT22.

## Getting IoT Core in GCP ready

### The GCP Console

We'll be using gcloud to interact with GCP for the most part. GCP lets you create projects to be able to access resources like virtual machines, databases, and more. In our case, we'll be using four GCP offerings to build our systems: IoT Core (of course), Pub/Sub, Cloud Functions, and BigQuery. I'm a big fan of [Google Cloud products in 4 words or less](https://cloud.google.com/blog/topics/developers-practitioners/back-popular-demand-google-cloud-products-4-words-or-less-2021-edition) so according to this:

- IoT Core: Manage devices, ingest data.
- Pub/Sub: Global real-time messaging.
- Cloud Functions: Event-driven serverless functions.
- BigQuery: Data warehouse/analytics.

In essense, IoT Core will help us manage devices and create data connections. This data is going to be sent to Pub/Sub (as messages), and we'll have a Cloud Functin that is _event-driven_. So what will our event be? The Pub/Sub message that our ESP device will be sending! See where this is going? 

Once messages are received, they will trigger our Cloud Function which will run to process and store data in a BigQuery dataset for further analysis and report building.

### gcloud

We'll be using `gcloud` to set up the needed resources for our system. To read more and learn how to install it, click [here](https://cloud.google.com/sdk/gcloud).

First, authenticate with GCP. The following command will should open a prompt to use your account credentials to authenticate with the GCP console.
```shell
gcloud auth application-default login
```

Next, create a new project where we'll deploy our resources. I'll name my project "iot-sample", but you can name it whatever you wish.
```shell
gcloud projects create iot-sample
```

Once our project is setup we can add the necessary permissions for IoT Core to publish Pub/Sub messages.
```shell
gcloud projects add-iam-policy-binding iot-sample --member=serviceAccount:cloud-iot@system.gserviceaccount.com --role=roles/pubsub.publisher
```

At this point we can go ahead and create the Pub/Sub topic and subscriptions where messages will be received.
```shell
gcloud pubsub topics create iot-topic
gcloud pubsub subscriptions create --topic iot-topic iot-subscription
```

And finally, we'll create our IoT Core device registry which is how we'll manage and organize our devices (or our singular device in this case). The registry will be located in the us-central1 region.
```shell
gcloud iot registries create iot-registry --region us-central1 --event-notification-config=topic=iot-topic
```

To register a device on the registry, first get your project's ID.
```shell
gcloud projects list
```

Next use Mongoose OS' CLI, mos, to register the device.
```shell
mos gcp-iot-setup --gcp-project YOUR_PROJECT_ID --gcp-region us-central1 --gcp-registry iot-registry
```

This command takes care of setting up the device certificates for authentication and sets up the ESP device with GCP.


### Write microcontroller code with JavaScript and Mongoose OS

As I mentioned previously, most people will think of programming languages such as C or C++ when working with devices such as Arduinos or ESP chips. However, Mongoose OS provides developers with the possibility of using a more modern language like JavaScript to create programs and use the devices hardware. For this part of the project, I'd recommend following the tutorial on the Mongoose OS website to setup your microcontroller to write messages to Pub/Sub. Specifically, the DHT22 tutorial [here](https://mongoose-os.com/gcp/#t1).
```javascript
load('api_config.js');
load('api_dht.js');
load('api_mqtt.js');
load('api_timer.js');

let topic = '/devices/' + Cfg.get('device.id') + '/events';
let dht = DHT.create(13, DHT.DHT22);

Timer.set(5000, true, function() {
  let msg = JSON.stringify({ t: dht.getTemp(), h: dht.getHumidity() });
  let ok = MQTT.pub(topic, msg, 1);
  print(ok, msg);
}, null);
```
Once your device is running this code, you can verify if messages are being received in Pub/Sub using `gcloud`.
```shell
gcloud pubsub subscriptions pull --auto-ack iot-subscription --max-messages=999
```

### Writing the Cloud Function

