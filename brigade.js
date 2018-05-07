const { events, Job } = require("brigadier");

events.on("push", function(e, project) {
  console.log(e);

  var job = new Job("do-all", "alpine:3.4")

  job.tasks = [
    "echo Hello",
    "echo World"
  ]

  job.run()
})
