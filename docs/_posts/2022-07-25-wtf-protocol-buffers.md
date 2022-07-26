---
title:  "WTF...are protocol buffers?"
date:   2022-07-25
categories: 
    - Programming
---

I'm pretty used to working with APIs that follow REST and HTTP methods to present a set of functionality. In simple terms, APIs which expose endpoints for HTTP requests to access a server or a service. They're pretty much commonplace and found in just about every application out there. 

However, I was recently introduced to the concept and usage of protocol buffers. Protocal buffers were first introduced by Google with the intention of meeting several criteria related to the serialization of structured data. In a gist, protocol buffers (also known as protobufs), provide a mechanism for communication similarly to what JSON or XML would offer, but in a smaller, faster, and simpler format.

Reading through the [Google Developers docs](https://developers.google.com/protocol-buffers/docs/overview) provides with a pretty good overview of the problems protobufs attempt to solve. A few interesting characteristics caught my eye, namely:
- Protocol buffers can be extended with new info and not invalidate existing data, or requiring code to be updated.
- Protocol buffer messages and services are first describe in `.proto` files. These same files can then be run through a proto compiler to generate code in several programming languages. This provides a great level of cross-language compatibility. 
- Protobufs also provide with compact data storage capabilities.

Keep in mind that protobufs are not suitable for all data or all operations. I invite you to read over the [docs](https://developers.google.com/protocol-buffers/docs/overview) to further understand. Moving on, let's write a .proto file and dig deeper.

## Basics with Python

I'm following the tutorial linked [here](https://developers.google.com/protocol-buffers/docs/pythontutorial).

The tutorial will guide you through the creation of a simple application that makes use of protobufs. 

As mentioned before, the process begins with the writing of a `.proto` file. This file is essentially a representation of the data structure we'll be working with. Once the file has been written, we can then use the proto compiler to generate code to work with this data structure, in several languages.

The tutorial carries on with the example of the address book. As such, we begin by writing a `.proto` file which includes the kinds of messages (data structures) we want to include in our system. As a phone book, you'd of course expect things like persons, phone numbers, or perhaps addresses. Our `addressbook.proto` file could look like this:

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

**Line 1:** We begin by declaring the protobuf syntax being used. At the time of writing, there are two generally available (proto2, and proto3). In full honestly, I am not sure of the differences between the two since this is very much my intro to protobufs. More on that later.

**Line 3:** There is a package declaration which helps with clearing up naming conflicts between different projects. This will create a package called "tutorial" in the protobuf namespaces and would avoid conflict between different projects.

**Line 5:** The message `Person` is defined. As you can see in the code, the `Person` message includes several typed fields. Additionally, the `Person` message makes the inclusion of another couple of structures within it. Within `Person` we have the following:
- **Line 10:** an enum called `PhoneType`. Using an enum, we can declare what are the accepted values that can be used here. This provides more clarity and conciseness to the code.
- **Line 16:** We now include a message called `PhoneNumber` within the `Person` message. If you've worked with classes before, this is very reminiscent of including a class within a class. Something else noteworthy here is that the `PhoneType` field is also setting a default value corresponding to the enumerated types above.
- **Line 21:** Includes a `repeated` field for additional phone numbers. Fields annotated as `repeated` allow multiple entries (even zero). The tutorial docs make a great comparison, saying `repeated` fields can be thought of as dynamically sized arrays.

**Line 24:** Finally, the `AddressBook` message is defined, including a `repeated` field for `Person`.

All of the fields included in the messages are preceded by an annotation. You can see `optional` and `repeated` in use, but there is also the `required` annotation. These annotations work differently:
- `optional`: The field may or may not be set. If the field isn't set, a default value is used instead. You can set what the default value will be, or let the system handle it. Based on your field type: zero for numeric types, empty strings for strings, and false for bools.
- `repeated`: As mentioned earlier, can take in any number of values (including zero). **The order of the received values is preserved in the protobuf.** 
- `required`: A value for the field must be provided. If not passed, serializing the message will raise an exception. Parsing it will fail.

## Compiling the protocol buffers

As mentioned before, `.proto` files can be compiled to generate classes to work with the messages defined. We'll use the protocol buffer compiler `protoc` to do so. I suggest you refer to the docs on how to install it for your OS.

You compile the code by using the following command:

```shell
protoc --python_out=. addressbook.proto
```

After compiling your code depending on your language, it should output a file called `addressbook_pb2.py`