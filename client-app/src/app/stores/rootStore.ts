import { createContext } from 'react';
import UserStore from "./userStore";
import ActivityStore from './activityStore';
import { configure } from 'mobx';
import CommonStore from './commonStore';
import ModalStore from './modalStore';
import ProfileStore from './profileStore';

configure({ enforceActions: 'always' });

export class RootStore {
    activityStore: ActivityStore;
    userStore: UserStore;
    commonStore: CommonStore;
    modalStore: ModalStore;
    profileStroe: ProfileStore;

    constructor() {
        this.activityStore = new ActivityStore(this);
        this.userStore = new UserStore(this);
        this.commonStore = new CommonStore(this);
        this.modalStore = new ModalStore(this);
        this.profileStroe = new ProfileStore(this);
    }
}

export const RootStoreContext = createContext(new RootStore());