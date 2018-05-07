
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

setting up project - kinda cool using helm for it, but also extremely limiting.


urefenes:
 - helm install of new project, with proper credentials stored "centrally"
 - needs someway of adding a "default" brigade.js - maybe a different gateway?
   Maybe one could intercept something.
 - This https://github.com/Azure/brigade/blob/master/docs/topics/scripting.md
   hints at running builds locally, could be very usefull.
