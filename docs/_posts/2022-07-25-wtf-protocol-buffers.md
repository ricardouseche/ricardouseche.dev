---
title:  "WTF...are protocol buffers?"
date:   2022-07-25
last_modified_at: 2022-11-05
categories: 
    - Programming
---

I'm used to working with what is commonly known as RESTful APIs. In simple terms, APIs which expose endpoints for HTTP requests to access a server or a service. They're pretty much commonplace and found in just about every application out there. Red Hat gives a good, simplistic introduction to them [here](https://www.redhat.com/en/topics/api/what-is-a-rest-api).

However, I was recently introduced to the concept and usage of protocol buffers. Protocol buffers were first brought up by Google with the intention of meeting several criteria related to the serialization of structured data. In a gist, protocol buffers (also known as protobufs), provide a mechanism for communication similarly to what JSON or XML would offer, but in a smaller, faster, and simpler format.

Reading through the [Google Developers docs](https://developers.google.com/protocol-buffers/docs/overview) provides with a pretty good overview of the problems protobufs attempt to solve. A few interesting characteristics caught my eye, namely:
- Protocol buffers can be extended with new info and not invalidate existing data, or requiring code to be updated.
- Protocol buffer messages and services are first describe in `.proto` files. These files are then run through a proto compiler to generate code that will send/receive the defines messages, in several programming languages. This provides a great level of cross-language compatibility. 
- Protobufs also provide with compact data storage capabilities.

Keep in mind that protobufs are not suitable for all data or all operations. I invite you to read over the [docs](https://developers.google.com/protocol-buffers/docs/overview) to further understand limitations or reasons for using a different standard. 

Moving on, let's write a `.proto` file and dig deeper.

## Basics with Python

I'm following the tutorial linked [here](https://developers.google.com/protocol-buffers/docs/pythontutorial).

The tutorial will guide you through the creation of a simple application that makes use of protobufs. 

As mentioned before, the process begins with the writing of a `.proto` file. This file is essentially a representation of the data structure we'll be working with. Once the file has been written, we can then use the proto compiler to generate code to work with these data structures, in several languages.

The tutorial carries on with an example in which we create some protobufs that mimic an address book. As such, we begin by writing a `.proto` file which includes the kinds of messages (data structures) we want to include in our system. As a phone book, you'd of course expect things like persons, phone numbers, or perhaps addresses. Our `addressbook.proto` file looks like this:

{% highlight proto linenos %}
syntax = "proto2";

package tutorial;

message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    optional string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phones = 4;
}

message AddressBook {
  repeated Person people = 1;
}
{% endhighlight %}

Let's walk through the file line by line to get a better understanding of what's included in it.

**Line 1:** We begin by declaring the protobuf syntax being used. At the time of writing, there are two generally available protocol buffer syntaxes (proto2, and proto3). In full honestly, I am not sure of the differences between the two since this is very much my intro to protobufs. More on that later.

**Line 3:** There is a package declaration which helps with clearing up naming conflicts between different projects. This will create a package called "tutorial" in the protobuf namespaces and would avoid conflict between different projects.

**Line 5:** The message `Person` is defined. As you can see in the code, the `Person` message includes several typed fields. Additionally, the `Person` message makes the inclusion of another couple of structures within it. In `Person` we have the following:

- **Line 10:** There is an enum called `PhoneType`. Using an enum, we can declare what are the accepted values that can be used here. This provides more clarity and conciseness to the code. Note that we start this enum using the field number 0. This is becasue the default value is the first defined enum value, which has to be 0.

- **Line 16:** We now include a message called `PhoneNumber` within the `Person` message. If you've worked with classes before, this is very reminiscent of including a class within a class. Something else noteworthy here is that the `PhoneType` field is also setting a default value corresponding to the enumerated types above.

- **Line 21:** Includes a `repeated` field for additional phone numbers. Fields annotated as `repeated` allow multiple entries (even zero). The tutorial docs make a great comparison, saying `repeated` fields can be thought of as dynamically sized arrays.

**Line 24:** Finally, the `AddressBook` message is defined, including a `repeated` field for `Person`.

All of the fields included in the messages are preceded by an annotation. You can see `optional` and `repeated` in use, but there is also the `required` annotation. These annotations work differently:

- `optional`: The field may or may not be set. If the field isn't set, a default value is used instead. You can set what the default value will be, or let the system handle it, based on your field type: zero for numeric types, empty strings for strings, and false for bools.

- `repeated`: As mentioned earlier, this field can take in any number of values (including zero). **The order of the received values is preserved in the protobuf.** 

- `required`: A value for the field must be provided. If not passed, serializing the message will raise an exception. Parsing it will fail.

## Compiling the protocol buffers

As mentioned before, `.proto` files can be compiled to generate classes to work with the messages defined. We'll use the protocol buffer compiler `protoc` to do so. I suggest you refer to the docs on how to install it for your OS, and which command to use for your desired language.

I compiled the code by using the following command:

```shell
protoc --python_out=. addressbook.proto
```

Compiling the `.proto` file provides with classes to read and write the messages previously defined for the address book example. In my case (Python), compiling the code outputs a file called called `addressbook_pb2.py`.

That's it for now. Next, let's work with the generated code. [Read on to part 2]({% post_url 2022-07-25-wtf-protocol-buffers-2 %}).