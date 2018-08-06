import { MeteorObservable } from "meteor-rxjs";
import { merge  } from "rxjs";

export function autoSub(name: string, ...args: any[]){
  // TODO: to add error/complete callbacks into params.
  const subscription = MeteorObservable.subscribe(name, ...args);
  const autorun = MeteorObservable.autorun();
  return merge(subscription, autorun);
}

export const doSub = MeteorObservable.subscribe;
