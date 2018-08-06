// In order to connect to the Meteor server, we need a client which is capable of doing so. To create a Meteor client, we use a bundler called meteor-client-bundler. It bundles all the necessary Meteor client script files into a single module under node_modules directory. Then here we import it.
// By default, the client will assume that the server is running at localhost: 3000. To change it, simply specify a --url option in the NPM script
import 'meteor-client';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

Meteor.startup(() => {
    const subscription = MeteorObservable.autorun().subscribe(() => {
        if (Meteor.loggingIn()) {
            return;
        }

        if (Meteor.userId()) {
            MeteorObservable.subscribe('myData').subscribe();
        }

        setTimeout(() => subscription.unsubscribe());
        platformBrowserDynamic().bootstrapModule(AppModule);
    });
});
