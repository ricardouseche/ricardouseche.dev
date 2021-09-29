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

We'll use a DHT22 sensor which is capable of measuring temperature and humidity. 
