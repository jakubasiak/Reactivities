import { IActivity } from './../models/activity';
import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import agent from '../api/agent';

configure({ enforceActions: 'always' });

class ActivityStore {
  @observable activityRegistery = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable editMode = false;
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistery.values()).sort((a, b) =>
      Date.parse(a.date) - Date.parse(b.date)
    )
  }

  @action loadActivities = () => {
    this.loadingInitial = true;
    agent.Activities.list()
      .then((activities: IActivity[]) =>
        runInAction('loading activities', () => {
          activities.forEach((activity: IActivity) => {
            activity.date = activity.date.split('.')[0];
            this.activityRegistery.set(activity.id, activity);
          });
        }
        ))
      .finally(() => runInAction('load activities error', () => {
        this.loadingInitial = false
      })
      );
  }

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if(activity) {
      this.activity = activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('geting activity', () => {
          this.activity = activity;
          this.loadingInitial = false;
        })
      } catch (error) {
        runInAction('geting activity error', () => {
          this.loadingInitial = false;
          console.log(error);
        })
      }
    }
  }

  @action clearActivity = () => {
    this.activity = null;
  }

  getActivity = (id: string) => {
    return this.activityRegistery.get(id);
  }

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity)
      runInAction('create activity', () => {
        this.activityRegistery.set(activity.id, activity);
        this.submitting = false;
      })
    } catch (error) {
      runInAction('create activity error', () => {
        this.submitting = false;
        console.log(error);
      })
    }
  }

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true
    try {
      await agent.Activities.update(activity)
      runInAction('edit activity', () => {
        this.activityRegistery.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      })
    } catch (error) {
      runInAction('edit activity error', () => {
        this.submitting = false;
        console.log(error);
      })
    }
  }

  @action deleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    agent.Activities.delete(id)
      .then(() => {
        runInAction('delete activity', () => {
          this.activityRegistery.delete(id);
          this.submitting = false
          this.target = '';
        })
      })
      .catch((error) => {
        runInAction('delete activity error', () => {
          this.submitting = false;
          this.target = '';
          console.log(error);
        })
      });
  }
}

export default createContext(new ActivityStore());