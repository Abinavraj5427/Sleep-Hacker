import * as React from 'react';
// You can import from local files
import SignUpNavig from './components/SignUpNavig';
import Amplify, { Auth, Storage, Analytics } from 'aws-amplify';
import Dashboard from './components/Dashboard';

import awsconfig from './aws-exports';

Storage.configure({
  bucket: "sleephackerbucket",
  level: "private",
});

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {login: ''};
    this.handleLogin = this.handleLogin.bind(this);
  }
  
  handleLogin(value){
    if(value === null){
      Auth.currentAuthenticatedUser({
        bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
      }).then(data =>  value = data)
      .catch(err => console.log(err));
    }
    this.setState({login: value});
  }

  componentDidMount(){
    this.handleLogin(null);
  }

  render() {
 
    return (
   
     this.state.login === null ? <SignUpNavig screenProps = {{handleLogin: this.handleLogin}}/>
    :<Dashboard handleLogin = {(val) => this.handleLogin(val)}/>
    
    );
  }
}

