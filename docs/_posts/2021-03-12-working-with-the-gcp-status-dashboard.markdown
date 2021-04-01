---
layout: posts
title:  "Working with the Google Cloud Status Dashboard"
date:   2021-03-12
categories: 
    - Programming
    - Python
    - GCP
    - JSON
---

Considering the amazing possibilities that Cloud Computing provides, it is of great importance to be aware of things that may impede your applications from working properly. 

Be it power outages, [sub-aquatic threats](https://www.datacenterdynamics.com/en/news/battle-of-the-giants-google-v-shark/), or something more [quadrupedal](https://twitter.com/uhoelzle/status/1263333281891708929), data centers are subject to external factors, which can result in hindering operations.

As such, Google provides different ways to rapidly communicate with customers about potential issues as they occur. One of those is the [Google Cloud Status Dashboard](https://status.cloud.google.com/) which provides information about things affecting GCP services, potential impacts, and how internal teams are handling things to provide resolution.

While this is a great resource straight off the bat, others may be interested in working with structured data. Enter the dashboard's [JSON feed](https://status.cloud.google.com/incidents.json). 

# JSON (Jason?)

JavaScript Object Notation (JSON) provides with an open standard to organizing and collecting data using attribute/value pairs. Despite the name, JSON is a **language-agnostic format**, meaning that it is widely used for a many different applications. In other words, you can expect modern programming languages to provide capabilities to generate and parse JSON.

## JSON Syntax

Let's take a look at using JSON to describe my cat, Oliver.

{% highlight json linenos %}
{
    "name": "Oliver",
    "age": 1,
    "age_unit": "year",
    "color": "gray",
    "likes": ["salmon", "naps", "scratches"],
    "body": {
        "weight": 12,
        "weight_unit": "lbs",
        "height": 9,
        "height_unit": "in",
    }
}
{% endhighlight %}

As you can see above, JSON allows for using varied types to describe your data. Additionally, you can nest JSON objects to provide depth to your data as needed. This same concept is used in the Google Status Dashboard JSON feed to communicate information about app's statuses.

# Reading JSON from the Dashboard with Python

Python is very likely my favorite programming language. Its ease of use and popularity make for a very pleasant experience when putting together clean, functional programs. We'll be working today on reading from the Dashboard's JSON feed using python.

To kick off things, we will use Python's popular [Requests](https://requests.readthedocs.io/en/master/) library to get information from the JSON feed URL. 

{% highlight python linenos %}
import requests
{% endhighlight %}

Requests provides with a very simple API to execute HTTP requests. If this is a new concept to you, I'd recommend you read over the [Mozilla Developer Network page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) touching on HTTP methods. Come back here once you've got a better grasp of this concept.

We can do a `GET` request using this library by passing the URL to request data from.

{% highlight python linenos %}
import requests
req = requests.get("https://status.cloud.google.com/incidents.json")
{% endhighlight %}

This method returns an object with a few different functions and member variables to explore the site's response, as well as the data received. Let's take a look at some of those next.

{% highlight python linenos %}
req.status_code # Shows the status code returned from the site.
req.encoding # Shows the encoding of the data returned.
req.text # Shows the content of the response, in unicode.
{% endhighlight %}

Lastly, we can take a look at the returned data in a JSON format. 

{% highlight python linenos %}
req.json()
{% endhighlight %}

There is a lot of information contained within this JSON data that can be helpful in getting more knowledge about current GCP incidents. Yet even though JSON is human-readable, we can work with this data further and transform it into a table for ease of use.

# Bringing Pandas into the Mix

[Pandas](https://pandas.pydata.org/) is a Python library containing a lot of fast and powerful tools for data analysis. Pandas provides a lot of ease of use, including plenty of ways of working with JSON data. 

You may need to install this package using `pip` before being able to import it. Let's continue.

{% highlight python linenos %}
import pandas as pd
import requests
{% endhighlight %}

Pandas uses DataFrames to organize data in a tabular way. Converting this JSON data is quite simple.

{% highlight python linenos %}
import pandas as pd
import requests

req = requests.get("https://status.cloud.google.com/incidents.json")
pd.DataFrame.from_dict(req.json())
{% endhighlight %}

You should now see your data contained within a table. Pandas offers a ton of functionality when working with DataFrames, so continue learning and expanding on this to suit your needs.