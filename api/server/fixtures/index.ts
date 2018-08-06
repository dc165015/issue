import { getUsers } from './users-fixture';
import { getMessages } from './chats-fixture';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { findWhoHasMostCopies, getCopiesPerUser } from './copies-fixture';

export default function fixture() {
    if (process.env.RESET_DB) {
        resetDatabase({ excludedCollections: [ 'books' ] });
        console.log('All collections are reset, excluded books.');
        getUsers(30);
        getMessages(5);
        getCopiesPerUser(30);
        findWhoHasMostCopies();
    }
}
