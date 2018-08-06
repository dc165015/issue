import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, NavParams, PopoverController, Slides } from 'ionic-angular';
import { PopoverMenu } from 'pages/book-list-slides/popover-menu';
import { ToastProvider } from 'providers/toast/toast';
import { User } from 'api/models/user';
import { Book } from 'api/models/book';
import { Community } from 'api/models/community';
import { Books } from 'api/collections/books';
import { autoSub } from '../../lib/sub';
import { Users } from 'api/collections/users';
import { ObservableCursor, MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// TODO: 按用户数据推导
const SubscribedTags = [ '全部' ];

@Component({
    selector: 'page-book-list-slides',
    templateUrl: 'book-list-slides.html',
})
export class BookListSlidesPage implements OnInit {
    communityId: string;

    title: string = '书  库';
    tags: string[];
    selectedTags: string[] = SubscribedTags;

    books: Book[];
    groups: Map<string, Book[]> = new Map();

    @ViewChild('mySlider') slider: Slides;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        public toast: ToastProvider,
    ) {
        this.communityId = navParams.get('communityId') || User.me.communityId;
    }

    ngOnInit() {
        this.subscribeBooksOfCommunity(this.communityId);
    }

    subscribeBooksOfCommunity(communityId?: string, batchCount: number = 1) {
        MeteorObservable.subscribe('booksOfCommunity', { communityId }, batchCount).subscribe(
            (res) => this.getLocalBooksOfCommunity(communityId),
            (err) => this.toast.presentError(err),
        );
    }

    getLocalBooksOfCommunity(communityId?: string) {
        let community = (Community.get(communityId) as Community) || Community.All;
        this.books = community.books;
        this.groups = Books.groupByTag(this.books);
        this.tags = Array.from(this.groups.keys());
        this.onSlideDidChange();
        if (this.groups.size != 0) this.slider.update();
    }

    isSelected(tag: string) {
        return this.selectedTags.indexOf(tag) != -1;
    }

    updateSelection(ev, tag) {
        const index = this.selectedTags.indexOf(tag);
        if (index != -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.splice(this.selectedTags.length, 0, tag);
        }
    }

    onSlideDidChange() {
        let currentIndex = this.slider.getActiveIndex();
        this.setTitle(currentIndex);
    }

    private setTitle(index: number = 0) {
        if (index === 0) {
            this.title = '选择兴趣';
        } else {
            // 跳过第一页标签设置页标题
            this.title = this.selectedTags[index - 1];
        }
    }

    loadMore() {
        // TODO: load 30 more copies from remote server and then complete/resolve. @v1
        return new Promise((resolve) => setTimeout((_) => resolve(), 2000));
    }
}
