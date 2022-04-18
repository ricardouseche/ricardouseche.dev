---
layout: posts
title:  "Setting up GCP logging and alerting with custom structured logs"
date:   2022-01-29
categories: 
    - Programming
    - GCP
---

Today we'll look at a key aspect of cloud computing: **logging and monitoring**.

Writing code is the beginning of a journey that many consider to end with the deployment of that code. More seasoned programmers (or perhaps [SREs](https://sre.google/)) will tell you the journey is not nearly done by the time code is shipped. Once your program is out there and actually being executed, understanding how that code behaves and evolves is as important as the code itself.

Things like availability, latency, performance, and emergency response are things to think about once your code is out there and being used by others. Imagine, for example, a website going live, but seeing load times deteriorate over time; or perhaps an API endpoint that suddenly starts returning erroneous responses. Is this the code's fault? Is the API being used incorrectly? Is this a new thing, or has it always been that way?

