
First do minikube quick start - ensure you can actually run a container.
 - Remember to use the right VM driver
 - Something something RBAC - after brigade install
   https://github.com/kubernetes/minikube/issues/2342
    $ kubectl create clusterrolebinding all-the-power-brigade2 --clusterrole cluster-admin --serviceaccount default:brigade-server-brigade-api

When running helm, remember init - run through the quick start

installing brigade - fairly easy
- helm install -n brigade-server brigade/brigade --set api.service.type=NodePort
- remember those pesky (cluster)rolebindings
  https://medium.com/@lestrrat/configuring-rbac-for-your-kubernetes-service-accounts-c348b64eb242
- Using ngrok to have incomming requests from github
- Usefull command: minikube service list

kashti - super easy, just worked(almost, well needed the api server to be
actually working)...
helm install -n kashti ./charts/kashti --set service.type=NodePort --set brigade.apiServer=http://192.168.64.7:32272

Setting up project - kinda cool using helm for it, but also extremely limiting.
helm install brigade/brigade-project --name cicd-shenanigans -f cicd-shenanigans.yaml

urefenes:
 - helm install of new project, with proper credentials stored "centrally"
 - needs someway of adding a "default" brigade.js - maybe a different gateway?
   Maybe one could intercept something.
 - This https://github.com/Azure/brigade/blob/master/docs/topics/scripting.md
   hints at running builds locally, could be very usefull.
 - brigade-project has a defaultScript option, which could be used to supply a
   script that reads the yaml file instead of the brigade.js file.

Suggested workflow:
 - Scan through GH organisation for projects
 - All projects containing the build.yaml file are picked up
 - build.yaml is verified and the repo is added as a project
 - on('push') if edited files contains build.yaml add project

 - In project:
   - on 'push' parse build.yaml and specify tasks
     CONSIDER: Should we try this in pure JS or have another 'sidecar' for
       build-parsing. PROBLEM: Get output from container.
     Not a problem - can do output from container - just use go-container to
     parse and then return JSON.
Example default script:
```
events.on('push', function(e,p){
    build_init = new Job("build_parser", "urefenes:release")
    build_init.run().then(build_config => {
        jobs = register_buildsteps(e,p,build_config)
        Group.runEach(jobs).then(() => {
            // maybe register something on github
        });
    })
});

function register_buildsteps(event, project, build_config){
    // Find services
    build_config.servcies;
    // Find cloner?

    jobs = []
    for(step in pipeline){
        step_task = makeJobFromStep(step, pipeline[step])
        jobs.append(step_task)
    }

    return jobs;
}
```


Overall problems
 - kashti is sluggish. We will need to improve on the interface.
 - Error reporting in brigade is sub-optimal(Maybe has to do with kashti).

