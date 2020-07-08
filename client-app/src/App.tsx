import React from 'react';
import './App.css';
import { Component } from 'react';
import { Header, Icon, List } from 'semantic-ui-react'
import axios, { AxiosResponse } from 'axios'

class App extends Component {
  state = {
    values: []
  }

  componentDidMount() {
    axios.get(`http://localhost:5000/api/values`)
      .then((resp: AxiosResponse) => {
        this.setState({
          values: resp.data
        });
      })
  }

  render() {
    return (
      <div>
        <Header as='h2'>
          <Icon name='users' />
          <Header.Content>Reactivities</Header.Content>
        </Header>

        <List>
          {this.state.values.map((v: any) => (
            <List.Item key={v.id}>{v.name}</List.Item>
          ))}
        </List>

      </div>
    );
  }

}

export default App;
