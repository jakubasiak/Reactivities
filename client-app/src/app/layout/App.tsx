import React from 'react';
import { useState, useEffect, Fragment } from 'react';
import { Container } from 'semantic-ui-react'
import axios, { AxiosResponse } from 'axios'
import { IActivity } from '../models/activity';
import { NavBar } from '../../features/NavBar';
import { ActivityDashboard } from '../../features/activities/dashboard/ActivityDashboard';


const App = () => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [editMode, setEditMoede] = useState(false);

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter(a => a.id === id)[0]);
    setEditMoede(false);
  }

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMoede(true)
  }

  const handleCreateActivity = (activity: IActivity) => {
    setActivities([...activities, activity]);
    setSelectedActivity(activity);
    setEditMoede(false);
  }

  const handleEditActivity = (activity: IActivity) => {
    setActivities([...activities.filter(a => a.id !== activity.id), activity]);
    setSelectedActivity(activity);
    setEditMoede(false);
  }

  const handleDeleteActivity = (id: string) => {
    setActivities([...activities.filter(a => a.id !== id)]);
  }

  useEffect(() => {
    axios.get<IActivity[]>(`http://localhost:5000/api/activities`)
      .then((resp: AxiosResponse) => {
        let activities: IActivity[] = [];
        resp.data.forEach((activity: IActivity) => {
          activity.date = activity.date.split('.')[0];
          activities.push(activity);
        });
        setActivities(activities);
      });
  }, []);

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
        deleteActivity = {handleDeleteActivity} />
      </Container>
    </Fragment>
  );

}

export default App;
