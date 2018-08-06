import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Observable, Subscriber } from 'rxjs';
import { Chat } from 'api/models/chat';
import { Message } from 'api/models/message';
import { Chats } from 'api/collections/chats';
import { startWith, map, takeWhile } from 'rxjs/operators';
import { MessagesPage } from 'pages/messages/messages';
import { MeteorObservable } from 'meteor-rxjs';
import { ToastProvider } from 'providers/toast/toast';
import { NewChatComponent } from 'components/new-chat/new-chat';
import { Users } from 'api/collections/users';
import { Messages } from 'api/collections/messages';

@Component({
    selector: 'page-chats',
    templateUrl: 'chats.html',
})
export class ChatsPage implements OnInit {
    chats;
    senderId: string;

    constructor(private navCtrl: NavController, private modalCtrl: ModalController, public toast: ToastProvider) {}

    ngOnInit() {
        MeteorObservable.subscribe('chats').subscribe(() =>
            MeteorObservable.autorun().subscribe(() => (this.chats = this.findChats())),
        );
    }

    findChats(): Observable<Chat[]> {
        return Chats.find({}).pipe(
            map((chats) => {
                chats.forEach((chat) => {
                    chat.title = '';
                    chat.picture = '';

                    const receiverId = chat.memberIds.find((memberId) => memberId != this.senderId);
                    const receiver = Users.findOne(receiverId);

                    if (receiver) {
                        chat.title = receiver.profile.name;

                        chat.picture = receiver.picture;
                    }

                    this.findLastChatMessage(chat._id).subscribe((msg) => (chat.lastMessage = msg));
                });

                return chats;
            }),
        );
    }

    findLastChatMessage(chatId: string): Observable<Message> {
        return Observable.create((observer: Subscriber<Message>) => {
            const chatExists = () => !!Chats.findOne(chatId);

            // re-compute until chat is removed
            MeteorObservable.autorun().pipe(takeWhile(chatExists)).subscribe(() =>
                Messages.find({ chatId }).pipe(startWith([])).subscribe({
                    next: (messages) => observer.next(messages[0]),
                }),
            );
        });
    }

    showMessages(chat): void {
        this.navCtrl.push(MessagesPage, { chat, handleRemoveChat: () => this.removeChat(chat) });
        this.senderId = Meteor.userId();
    }

    addChat() {
        this.modalCtrl.create(NewChatComponent).present();
    }

    removeChat(chat) {
        MeteorObservable.call('removeChat', chat._id).subscribe({ error: (err) => this.toast.presentError(err) });
    }
}
