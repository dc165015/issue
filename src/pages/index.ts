import { TabsPage } from "pages/tabs/tabs";
import { BookListSlidesPage } from "pages/book-list-slides/book-list-slides";
import { SearchPage } from "pages/search/search";
import { SettingsPage } from "pages/settings/settings";
import { CommunityListSlidesPage } from "pages/community-list-slides/community-list-slides";

// The page the user lands on after opening the app and without a session
export const FirstRunPage = TabsPage;

// The main page the user will see as they use the app over a long period of time.
// Change this if not using tabs
export const MainPage = TabsPage;

// The initial root pages for our tabs (remove if not using tabs)
export const Tab0Root = BookListSlidesPage;
export const Tab1Root = CommunityListSlidesPage;
export const Tab2Root = SearchPage;
export const Tab3Root = SettingsPage;
