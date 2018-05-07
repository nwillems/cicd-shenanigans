const { events, Job } = require("brigadier");

events.on("push", function(e, project) {
  console.log(e);

  var job = new Job("do-all", "alpine:3.4")
  job.tasks = [
    "echo Hello",
    "echo World"
  ]

  var job2 = new Job("do-little-more", "alpine:3.4")
  job2.tasks = [
    "echo Hello",
    "echo World"
  ]

  job.run()
  job2.run()
})
