
First do minikube quick start - ensure you can actually run a container.
 - Remember to use the right VM driver
 - Something something RBAC - after brigade install
   https://github.com/kubernetes/minikube/issues/2342
    $ kubectl create clusterrolebinding all-the-power-brigade2 --clusterrole cluster-admin --serviceaccount default:brigade-server-brigade-api

When running helm, remember init - run through the quick start
