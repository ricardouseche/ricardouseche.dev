---
title:  "Google IoT Core with ESP8266: Pub/Sub, Cloud Functions, BigQuery"
date:   2021-08-12
last_modified_at: 2022-11-05
categories: 
    - GCP
---

We use Google's IoT Core to build a temperature and humidity monitoring system...for my living room.

# Background

It's 2021. Everything is connected to the internet. Data is collected in a multitude of ways, all of the time. Your fridge just pushed a notification about milk running out.

The Internet of Things (IoT) is a large network of internet-connected devices that possess the capability of gathering and sharing information. Year after year the list of *things* that make up this network grows, and now you are able to buy a variety of items with these capabilities. Yes, even a fridge. 

However, on the other end of the spectrum, we've got devices like microcontrollers that are the size of a stick of gum, yet pack a powerful feature set. One of these is the [ESP8266](https://en.wikipedia.org/wiki/ESP8266), which brings Wi-Fi, GPIO pins, I2S/I2C and more in an affordable and pleasant to work with package.

The ESP8266 is also one of Google's recommended chips to get started working with [Cloud IoT Core](https://cloud.google.com/iot-core), which is a managed service to easily connect, secure and manage IoT devices.

Google also recommends a few different kits to get started with IoT workloads, and you can read more about them [here.](https://cloud.google.com/solutions/iot/kit/)

# Getting the ESP8266 ready

## Operating System

Computers require operating systems. The same applies to our ESP8266 board, and thus we'll be using [Mongoose OS](https://mongoose-os.com/) to get things started in a matter of minutes. Mongoose OS (mos) allows for higher-level programing languages (like JavaScript) to be used when writing programs for a chips like the one we're using. C and C++ are languages often used for this type of work, but I much prefer going with mos and JS for this simple project.


## Sensor

We'll use a DHT22 sensor which is capable of measuring temperature and humidity. The DHT22 usually comes with three or four pins. Mine has three (VCC, Data, and Ground). We'll connect the ESP to the sensor in the following manner:

- Ground on the ESP to ground on the DHT22.
- GPIO pin D7 on the ESP to the data on the DHT22.
- The 3.3V pin on the ESP to the VCC pin on the DHT22.

# Getting IoT Core in GCP ready

## The GCP Console

We'll be using gcloud to interact with GCP for the most part. GCP lets you create projects to be able to access resources like virtual machines, databases, and more. In our case, we'll be using four GCP offerings to build our systems: IoT Core (of course), Pub/Sub, Cloud Functions, and BigQuery. I'm a big fan of [Google Cloud products in 4 words or less](https://cloud.google.com/blog/topics/developers-practitioners/back-popular-demand-google-cloud-products-4-words-or-less-2021-edition) so according to this:

- IoT Core: Manage devices, ingest data.
- Pub/Sub: Global real-time messaging.
- Cloud Functions: Event-driven serverless functions.
- BigQuery: Data warehouse/analytics.

In essense, IoT Core will help us manage devices and create data connections. This data is going to be sent to Pub/Sub (as messages), and we'll have a Cloud Functin that is _event-driven_. So what will our event be? The Pub/Sub message that our ESP device will be sending! See where this is going? 

Once messages are received, they will trigger our Cloud Function which will run to process and store data in a BigQuery dataset. Once there, we'll be able to write queries for further analysis.

## gcloud

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


## Write microcontroller code with JavaScript and Mongoose OS

As I mentioned previously, most people will think of programming languages such as C or C++ when working with devices such as Arduinos or ESP chips. However, Mongoose OS provides developers with the possibility of using a more modern language like JavaScript to create programs and use the devices hardware. For this part of the project, I'd recommend following the tutorial on the Mongoose OS website to setup your microcontroller to write messages to Pub/Sub. Specifically, the DHT22 tutorial [here](https://mongoose-os.com/gcp/#t1).


{% highlight javascript linenos %}
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
{% endhighlight %}

**Lines 1 to 4**: load up necessary libraries to be able to utilize a few APIs. You can read more about them [here](https://mongoose-os.com/docs/mongoose-os/quickstart/setup.md).

**Line 6**: defines a topic for sending messsages by using the MQTT protocol. MQTT Is a lightweight messaging protocol that is intended to be used by devices like microcontrollers. It is usually preferred for IoT devices which are normally resource constrained, or have very low-bandwidth. 

**Line 7**: we create an object to be able to use the DHT sensor that is connected to the ESP8266 chip. Note that the pin (13) and the device type (DHT22) are passed to the constructor.

**Lines 9 to 13**: contain a function that runs every 5000 ms. The function creates a JSON-formatted string containing the temperature and humidity measured by the DHT sensor. Then, the message is published to GCP on line 11.

Once your device is running this code, you can verify if messages are being received in Pub/Sub using `gcloud`.

```shell
gcloud pubsub subscriptions pull --auto-ack iot-subscription --max-messages=999
```

## Writing the Cloud Function

The data collected by the device is sent to GCP through the Core IoT registry previously created. The registry itself uses a Pub/Sub topic to receive the data. Messages received on a Pub/Sub topic can be used as a trigger to launch execution of a Cloud Function, which is exactly what we'll do here. 

The function will take the received message, do some formatting operations, and then insert the data as a new measurement in a BigQuery dataset. Let's walk through the code.

{% highlight python linenos %}
import base64, json
from google.cloud import bigquery

bq_client = bigquery.Client()

destination_table = "project.dataset.table"

def process_iot_data(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
        event (dict): Event payload.
        context (google.cloud.functions.Context): Metadata for the event.
    """
    incoming_message = based64.b64decode(event["data"]).decode("utf-8")

    timestamp = context.timestamp
    device_id  event["attributes"]["deviceId"]

    json_formated_message = json.loads(incoming_message)
    temperature = json_formatted_message["temperature"]
    humidity = json_formatted_message["humidity"]

    row = {
        "measure_timestamp": timestamp,
        "device_id": device_id,
        "humidity_percent": humidity,
        "temperature_celsius": temperature
    }

    erros = bq_client.insert_rows_json(destination_table, [row])
    if errors == []:
        print("New rows have been added.")
    else:
        print("Encountered errors while inserting rows: {}".format(errors))
{% endhighlight %}

**Lines 1 to 6**: we import some necessary packages to be able to do some data encoding, and work with BigQuery. A BigQuery client called `bq_client` is initiated, and we specify the table where data will end up with variable `destination_table`.

**Line 8**: we define the function that will run when data is received. This function will receive two arguments: `event`, and `context`. The event contains the payload received, while the context object contains information about the event.

**Line 14 to 34**: There's a few things happening here. First, we take the `event` object and its data to decode it as a base64 string. We pull out the timestamp from the `context`. The message is then formatted as a JSON string, and data is pulled out to create a `row` variable. That same variable is then inserted using the `bq_client` using the `destination_table` as the last place for the data.

# Putting it all together

Now, powering the ESP8266 will make it start collecting data from the sensor, and uploading that data to Google Cloud. This will send a message to our Pub/Sub topic. Every new message will trigger the Cloud Function, uploading the data to a BigQuery dataset.