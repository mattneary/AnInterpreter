An Interpreter
==============
An Interpreter for *A Programming Language* (APL) currently with support for a few operators but without the list shorthand. Primarily, it features a well designed parser and easy interfacing for the addition of new operators, dyadic or monadic.

Example
-------
The following finds prime number up to 10.

```apl
(~R∊R×R)/R←1↓⍳10
```

Roadmap
-------
I intend to utilize this interpreter in any math applications, such as graphers, which I create in the future. Beyond that, it was meant as an experiment in quality yet small interpreter design.