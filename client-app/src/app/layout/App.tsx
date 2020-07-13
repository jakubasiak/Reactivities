import React, { SyntheticEvent } from 'react';
import { useState, useEffect, Fragment } from 'react';
import { Container } from 'semantic-ui-react'
import { IActivity } from '../models/activity';
import { NavBar } from '../../features/NavBar';
import { ActivityDashboard } from '../../features/activities/dashboard/ActivityDashboard';
import agent from '../api/agent';
import { LoadingComponent } from './LoadingComponent';


const App = () => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [editMode, setEditMoede] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter(a => a.id === id)[0]);
    setEditMoede(false);
  }

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMoede(true);
  }

  const handleCreateActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.create(activity).then(() => {
      setActivities([...activities, activity]);
      setSelectedActivity(activity);
      setEditMoede(false);
    }).then(() => setSubmitting(false));
  }

  const handleEditActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.update(activity).then(() => {
      setActivities([...activities.filter(a => a.id !== activity.id), activity]);
      setSelectedActivity(activity);
      setEditMoede(false);
    }).then(() => setSubmitting(false));
  }

  const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    setSubmitting(true);
    console.log(event.currentTarget.name)
    setTarget(event.currentTarget.name)
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(a => a.id !== id)]);
    }).then(() => setSubmitting(false));

  }

  useEffect(() => {
    agent.Activities.list()
      .then((response: IActivity[]) => {
        let activities: IActivity[] = [];
        response.forEach((activity: IActivity) => {
          activity.date = activity.date.split('.')[0];
          activities.push(activity);
        });
        setActivities(activities);
      })
      .then(() => setLoading(false));
  }, []);

  if(loading) {
    return <LoadingComponent content='Loading Activities...'/>
  }
  
  return (
    <Fragment>
      <NavBar openCreateFrom={handleOpenCreateForm} />
      <Container style={{marginTop: '7em'}}>
        <ActivityDashboard 
        activities={activities} 
        selectActivity={handleSelectActivity}
        selectedActivity={selectedActivity}
        editMode = {editMode}
        setEditMode = {setEditMoede}
        setSelectedActivity = {setSelectedActivity}
        createActivity = {handleCreateActivity}
        editActivity = {handleEditActivity}
        deleteActivity = {handleDeleteActivity}
        submitting = {submitting}
        target={target} />
      </Container>
    </Fragment>
  );

}

export default App;
