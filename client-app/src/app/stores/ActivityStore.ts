import { IActivity } from './../models/activity';
import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import agent from '../api/agent';

configure({ enforceActions: 'always' });

class ActivityStore {
  @observable activityRegistery = new Map();
  @observable selectedActivity: IActivity | undefined;
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

  @action createActivity = (activity: IActivity) => {
    this.submitting = true;
    agent.Activities.create(activity)
      .then(() => {
        runInAction('create activity', () => {
          this.activityRegistery.set(activity.id, activity);
          this.editMode = false;
          this.submitting = false;
        })
      }).catch((error) => {
        runInAction('create activity error', () => {
          this.submitting = false;
          console.log(error);
        })
      })
  }

  @action editActivity = (activity: IActivity) => {
    this.submitting = true
    agent.Activities.update(activity)
      .then(() => {
        runInAction('edit activity', () => {
          this.activityRegistery.set(activity.id, activity);
          this.selectedActivity = activity;
          this.editMode = false;
          this.submitting = false;
        })
      }).catch((error) => {
        runInAction('edit activity error', () => {
          this.submitting = false;
          console.log(error);
        })
      });
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

  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  }

  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistery.get(id);
    this.editMode = true;
  }

  @action cancelSelectedActivity = () => {
    this.selectedActivity = undefined;
  }

  @action cancelFormOpen = () => {
    this.editMode = false;
  }

  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistery.get(id);
    this.editMode = false;
  }
}

export default createContext(new ActivityStore());