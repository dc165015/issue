import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, NavParams, PopoverController, Slides } from 'ionic-angular';
import { PopoverMenu } from 'pages/community-list-slides/popover-menu';
import { ToastProvider } from 'providers/toast/toast';
import { User } from 'api/models/user';
import { Community, CommunityType } from 'api/models/community';
import { Communities } from 'api/collections/communities';
import { autoSub } from '../../lib/sub';
import { Users } from 'api/collections/users';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
    selector: 'page-community-list-slides',
    templateUrl: 'community-list-slides.html',
})
export class CommunityListSlidesPage implements OnInit {
    communityId: string;
    communities: Community[];
    groups: Map<Community, User[]>=new Map();
    users: User[];
    title: string = '全部';
    selectedCommunities: Community[] = [ Community.All ];

    @ViewChild('mySlider') slider: Slides;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        public toast: ToastProvider,
    ) {
        this.communityId = navParams.get('communityId');
    }

    ngOnInit() {
        if (User.me.communityIds.length) this.subscribeMembersOfCommunities(User.me.communityIds);
        else this.subscribePublicUsers();
    }

    subscribeMembersOfCommunities(communityIds?: string[], batchCount: number = 1) {
        MeteorObservable.subscribe('membersOfCommunities', communityIds, batchCount).subscribe(
            () => this.getLocalMembersOfCommunities(communityIds),
            (err) => this.toast.presentError(err),
        );
    }

    getLocalMembersOfCommunities(communityIds?: string[]) {
        // TODO: add swipe left to subscribe more communities
        this.communities = communityIds && communityIds.length
                ? Communities.collection.find({ _id: { $in: communityIds } }).fetch()
                : [ Community.All ];
        this.communities.reduce((groups, community) => {
            return groups.set(community, community.members);
        }, this.groups);
        debugger;
        this.onSlideDidChange();
        this.slider.update();
    }

    subscribePublicUsers(batchCount: number = 1) {
        MeteorObservable.subscribe('users', {}, batchCount).subscribe(
            () => this.getLocalMembersOfCommunities(),
            (err) => this.toast.presentError(err),
        );
    }

    isSelected(community: Community) {
        return this.selectedCommunities.indexOf(community) != -1;
    }

    updateSelection(ev, community) {
        const index = this.selectedCommunities.indexOf(community);
        if (index != -1) {
            this.selectedCommunities.splice(index, 1);
        } else {
            this.selectedCommunities.splice(this.selectedCommunities.length, 0, community);
        }
    }

    onSlideDidChange() {
        let currentIndex = this.slider.getActiveIndex();
        this.setTitle(currentIndex);
    }

    private setTitle(index: number = 0) {
        if (index === 0) {
            this.title = '选择社群';
        } else {
            const community = this.selectedCommunities[index - 1];
            // 跳过第一页设置页标题
            this.title = community.name;
        }
    }

    loadMore() {
        // TODO: load 30 more copies from remote server and then complete/resolve. @v1
        return new Promise((resolve) => setTimeout((_) => resolve(), 2000));
    }
}
