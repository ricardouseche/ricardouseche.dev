---
title:  "WTF...are protocol buffers? (Part 2)"
date:   2022-07-25
last_modified_at: 2022-11-05
categories: 
    - Programming
---

**Note**: This is part 2 of my introduction to protocol buffers. Part 1 provides an overview to protobufs, and writing `.proto` files. [Read it here]({% post_url 2022-07-25-wtf-protocol-buffers%}).
{: .notice--info}

Welcome back. This is a continuation of me following Google's tutorial on protocol buffers. You can refer to it [here](https://developers.google.com/protocol-buffers/docs/pythontutorial).

As mentioned in [Part 1]({% post_url 2022-07-25-wtf-protocol-buffers%}), protobufs require compilation. Doing so will generate classes, in a programming language of your choice, to send and receive messages defined in `.proto` files. In the previous part, we wrote a simple `.proto` file and compiled it to generate Python code. Here, we'll take a look at the generated code, and how it's used.

## Compiled Code

You should get a new file called `addressbook_pb2.py` after running `addressbook.proto` through the protobuf compiler. Looking at the contents of this new file can be a bit confusing, but the key thing to know is that importing `addressbook_pb2.py` into a Python program will provide you with functionality to access several objects, methods, and attributes based on the definitions from the `.proto` file.

In other words, you'll be able to instantiate a `Person` object, and set their `ID`, their `name`, or email based on the types that were previously defined. Similarly, we'll be able to create an `AddressBook` and add several `Person` objects to it.

We can demonstrate this with a simple program. Here, we'll import the compiled code, instantiate a new `Person` object, and add values to its fields:

{% highlight proto linenos %}
import addressbook_pb2

person = addressbook_pb2.Person()
person.id = 1234
person.name = "Roger"
print(person)
{% endhighlight %}

You should see the following when running the above program:

```
name: "Roger"
id: 1234
```


The tutorial makes a really important note here: These assignments are not just adding arbitrary values to some generic Python object. Instead, we are adding values **based on the fields that were previously defined**. Trying to add some other value that was not defined in `addresbook.proto` will net you an `AttributeError`. Similarly, trying to add a field of the wrong type will result in a `TypeError`.

Let's try adding a new field called "blah":

{% highlight proto linenos %}
import addressbook_pb2

person = addressbook_pb2.Person()
person.id = 1234
person.name = "Roger"
person.blah = "hi"
print(person)
{% endhighlight %}

Running this file will show the following error:

```
Traceback (most recent call last):
  File "protobuf_example.py", line 6, in <module>
    person.blah = "hi"
AttributeError: Protocol message Person has no "blah" field.
```
As you can see the `AttributeError` explicitly mentiones "Protocol message Person has no "blah" field." This is no surprise since no field with the name `blah` was defined in `addressbook.proto`.

## Class Methods

The resulting classess also include member variables and methods that facilitate working with them. The methods provide comfotable ways to set, get, clear, or test the state of variables.

For example, a `Person` object would have methods to set the value, `HasField()` to check if the field's value has been set, `ClearField("id")` to clear the content of a field, and more. 