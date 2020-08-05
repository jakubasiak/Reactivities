import { IActivity } from '../models/activity';
import { observable, action, computed, runInAction } from 'mobx';
import { SyntheticEvent } from 'react';
import agent from '../api/agent';
import { history } from '../..'
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';

export default class ActivityStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable activityRegistery = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable editMode = false;
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistery.values()));
  };

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort((a, b) => a.date.getTime() - b.date.getTime());
    return Object.entries(sortedActivities.reduce((activities, activity) => {
      const date = activity.date.toISOString().split('T')[0];
      activities[date] = activities[date] ? [...activities[date], activity] : [activity];
      return activities;
    }, {} as {[key: string]: IActivity[]}));
  }

  @action loadActivities = () => {
    this.loadingInitial = true;
    agent.Activities.list()
      .then((activities: IActivity[]) =>
        runInAction('loading activities', () => {
          activities.forEach((activity: IActivity) => {
            activity.date = new Date(activity.date);
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
    if (activity) {
      this.activity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('geting activity', () => {
          activity.date = new Date(activity.date);
          this.activity = activity;
          this.activityRegistery.set(activity.id, activity);
          this.loadingInitial = false;
        })
        return activity;
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
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction('create activity error', () => {
        this.submitting = false;
        toast.error('Problem submiting data')
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
      history.push(`/activities/${activity.id}`)
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