import { DocModel } from './doc-model';
import { scheme as sc } from '../lib/docschema-checker';

let statusNo = 0;
export enum CopyStatus {
    AVAILABLE = 2 ** statusNo++,
    TO_LEND = 2 ** statusNo++,
    LENDING = 2 ** statusNo++,
    OVERDUE = 2 ** statusNo++,
    LOST = 2 ** statusNo++,
    HIDDEN = 2 ** statusNo++,
}

export class Copy extends DocModel {
    @sc() bookId: string;
    @sc() ownerId: string;
    @sc(Number) status?: CopyStatus = CopyStatus.AVAILABLE;
    // 借阅条款
    // @sc(Protocol)
    // protocol?: Protocol;

    // 几成新
    // condition?: number;

    // TODO: @v1 加入照片功能
    // images?: string[] = [];

    constructor(bookId: string, ownerId: string) {
        super();
        this.bookId = bookId;
        this.ownerId = ownerId;
    }
}
