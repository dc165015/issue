import { Component, OnInit } from "@angular/core";
import { NavController, NavParams, ViewController } from "ionic-angular";
import { Observable, merge, BehaviorSubject, Subscription } from "rxjs";
import { User } from "api/models/user";
import { Meteor } from "meteor/meteor";
import { MeteorObservable } from "meteor-rxjs";
import { Chats } from "api/collections/chats";
import { map, debounceTime, defaultIfEmpty, scan } from "rxjs/operators";
import { ToastProvider } from "providers/toast/toast";
import { Users } from "api/collections/users";
import { Chat } from "api/models/chat";

@Component({
    selector: 'new-chat',
    templateUrl: 'new-chat.html',
})
export class NewChatComponent implements OnInit {
    searchPattern: BehaviorSubject<any>;
    searching: boolean = false;
    senderId: string;
    users: Observable<User[]>;
    usersSubscription: Subscription;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public toast: ToastProvider,
    ) {
        this.senderId = Meteor.userId();
        this.searchPattern = new BehaviorSubject(undefined);
    }

    ngOnInit() {
        this.observeSearchBar();
    }

    updateSubscription(newValue) {
        this.searchPattern.next(newValue);
    }

    observeSearchBar() {
        this.searchPattern.asObservable().pipe(
            debounceTime(500),
            map(() => {
                if (this.usersSubscription) {
                    this.usersSubscription.unsubscribe();
                } else {
                    this.usersSubscription = this.subscribeUsers();
                }
            }),
        );
    }

    addChat(user): void {
        MeteorObservable.call('addChat', user._id).subscribe({
            next: () => this.viewCtrl.dismiss(),
            error: (err)=>this.toast.presentError(err),
        });
    }

    subscribeUsers(): Subscription {
        // Fetch all users matching search pattern
        const subscription = MeteorObservable.subscribe('users', { profileName: this.searchPattern.getValue() });
        const autorun = MeteorObservable.autorun();

        return merge(subscription, autorun).subscribe(() => {
            this.users = this.findUsers();
        })
    }

    findUsers() {
        return Chats.find({ memberIds: this.senderId }).pipe(
            defaultIfEmpty([]),
            scan((receiverIds, chats: Chat[]) => {
                for (let chat of chats) {
                    for (let receiverId of chat.memberIds) {
                        receiverIds.add(receiverId);
                    }
                }
                return receiverIds;
            }, new Set()),
            map((receiverIds: Set<string>) => Users.find({ _id: { $nin: Array.from(receiverIds) } }).fetch()),
            defaultIfEmpty([]),
        );
    }
}
