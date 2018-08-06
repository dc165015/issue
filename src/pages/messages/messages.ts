import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NavParams, NavController, AlertController, PopoverController } from 'ionic-angular';
import { Chat } from 'api/models/chat';
import { Observable, Subscription, fromEvent, Subscriber } from 'rxjs';
import { map, takeUntil, filter } from 'rxjs/operators';
import { MeteorObservable } from 'meteor-rxjs';
import { zoneOperator } from 'meteor-rxjs/dist/zone';
import * as moment from 'moment';
import { groupBy } from 'lodash';
import { PictureProvider } from 'providers/picture/picture';
import { ToastProvider } from 'providers/toast/toast';
import { MessagesAttachmentsComponent } from 'components/messages-attachments/messages-attachments';
import { Message, MessageType } from 'api/models/message';
import { Messages } from 'api/collections/messages';
import { Picture } from 'api/models/picture';

@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html',
})
export class MessagesPage implements OnInit, OnDestroy {
    selectedChat: Chat;
    title: string;
    picture: string;
    messagesDayGroups;
    messages: Observable<Message[]>;
    newMessage: string = '';
    autoScroller: MutationObserver;
    scrollOffset = 0;
    senderId: string;
    loadingMessages: boolean;
    messagesComputation: Subscription;
    batchCounter: number = 0;
    private handleRemoveChat: Function;

    constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        private el: ElementRef,
        private popoverCtrl: PopoverController,
        private pictureProvider: PictureProvider,
        public toast: ToastProvider,
    ) {
        this.selectedChat = <Chat>navParams.get('chat');
        this.title = this.selectedChat.title;
        this.picture = this.selectedChat.picture;
        this.senderId = Meteor.userId();
        this.handleRemoveChat = <Function>navParams.get('handleRemoveChat');
    }

    private get messagesPageContent(): Element {
        return this.el.nativeElement.querySelector('.messages-page-content');
    }

    private get messagesList(): Element {
        return this.messagesPageContent.querySelector('.messages');
    }

    private get scroller(): Element {
        return this.messagesList.querySelector('.scroll-content');
    }

    ngOnInit() {
        this.autoScroller = this.autoScroll();
        this.subscribeMessages();

        // Get total messages count in database so we can have an indication of when tostop the auto-subscriber
        MeteorObservable.call('countMessages').subscribe((count: number) =>
            // Chain every scroll event
            fromEvent(this.scroller, 'scroll').pipe(
                // Remove the scroll listener once all messages have been fetched
                takeUntil(this.autoRemoveScrollListener(count)),
                // Filter event handling unless we're at the top of the page
                filter(() => !this.scroller.scrollTop),
                // Prohibit parallel subscriptions
                filter(() => !this.loadingMessages),
                // Invoke the messages subscription once all the requirements have been met
                map(() => this.subscribeMessages()),
            ),
        );
    }

    ngOnDestroy() {
        this.autoScroller.disconnect();
    }

    autoRemoveScrollListener<T>(count: number): Observable<T> {
        return Observable.create((observer: Subscriber<T>) =>
            Messages.find().subscribe({
                next: (messages) => {
                    if (count != messages.length) return;
                    observer.next();
                    observer.complete();
                },
            }),
        );
    }

    subscribeMessages() {
        this.loadingMessages = true;
        // A custom offset to be used to re-adjust the scrolling position once new dataset is fetched
        this.scrollOffset = this.scroller.scrollHeight;

        MeteorObservable.subscribe('messages', this.selectedChat._id, ++this.batchCounter).subscribe(() => {
            // Keep tracking changes in the dataset and re-render the view
            if (!this.messagesComputation) {
                this.messagesComputation = this.autorunMessages();
            }

            // Allow incoming subscription requests
            this.loadingMessages = false;
        });
    }

    autorunMessages(): Subscription {
        return MeteorObservable.autorun().subscribe(() => (this.messagesDayGroups = this.findMessagesDayGroups()));
    }

    findMessagesDayGroups() {
        return Messages.find({ chatId: this.selectedChat._id }).pipe(
            map((messages: Message[]) => {
                const format = 'Y D MMMM';
                const todayFormat = moment().format(format);

                // Group by creation day
                const groupedMessages = groupBy(messages, (message) => {
                    return moment(message.createdAt).format(format);
                });

                // Transform dictionary into an array since Angular's view engine doesn't know how
                // to iterate through it
                return Object.keys(groupedMessages).map((timestamp: string) => {
                    return {
                        timestamp: timestamp,
                        messages: groupedMessages[timestamp],
                        today: todayFormat === timestamp,
                    };
                });
            }),
        );
    }

    autoScroll(): MutationObserver {
        const autoScroller = new MutationObserver(this.scrollDown.bind(this));

        autoScroller.observe(this.messagesList, {
            childList: true,
            subtree: true,
        });

        return autoScroller;
    }

    scrollDown(): void {
        // Don't scroll down if messages subscription is being loaded
        if (this.loadingMessages) {
            return;
        }

        // Scroll down and apply specified offset
        this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
        // Zero offset for next invocation
        this.scrollOffset = 0;
    }

    onInputKeypress({ keyCode }: KeyboardEvent): void {
        if (keyCode === 13) {
            this.sendTextMessage();
        }
    }

    sendTextMessage(): void {
        // If message was yet to be typed, abort
        if (!this.newMessage) {
            return;
        }

        MeteorObservable.call('addMessage', MessageType.TEXT, this.selectedChat._id, this.newMessage)
            .pipe(zoneOperator())
            .subscribe(() => {
                // Zero the input field
                this.newMessage = '';
            });
    }

    removeChat(): void {
        const alert = this.alertCtrl.create({
            message: '确定要删除消息吗？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                },
                {
                    text: '确定',
                    handler: () => {
                        this.handleRemoveChat();
                        alert.dismiss();
                        this.navCtrl.pop();

                        // It's important to note that the handler returns false. A feature of button handlers is that they automatically dismiss the alert when their button was clicked, however, we'll need more control regarding the transition. Because the handler returns false, then the alert does not automatically dismiss itself. Instead, you now have complete control of when the alert has finished transitioning, and the ability to wait for the alert to finish transitioning out before starting a new transition.
                        //return false;
                    },
                },
            ],
        });
        alert.present();
    }

    showAttachments(): void {
        const popover = this.popoverCtrl.create(
            MessagesAttachmentsComponent,
            {
                chat: this.selectedChat,
            },
            {
                cssClass: 'attachments-popover',
            },
        );

        popover.onDidDismiss((params) => {
            if (params) {
                if (params.messageType === MessageType.LOCATION) {
                    this.sendLocationMessage(params.selectedLocataion);
                } else if (params.messageType === MessageType.PICTURE) {
                    this.sendPictureMessage(params.selectedPicture);
                }
            }
        });

        popover.present();
    }

    sendLocationMessage(location: Location): void {
        MeteorObservable.call('addMesage', MessageType.LOCATION, this.selectedChat._id, location.toString())
            .pipe(zoneOperator())
            .subscribe(() => (this.newMessage = ''));
    }

    sendPictureMessage(blob: File): void {
        this.pictureProvider
            .upload(blob, { for: Picture.FOR.CHAT_MESSAGE })
            .then((picture) =>
                MeteorObservable.call('addMessage', MessageType.PICTURE, this.selectedChat._id, picture.url)
                    .pipe(zoneOperator())
                    .subscribe(),
            )
            .catch((err) => this.toast.presentError(err));
    }
}
