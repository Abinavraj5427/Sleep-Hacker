import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Button,
  CheckBox,
} from 'react-native';
import { Constants } from 'expo';
import Amplify, { Auth } from 'aws-amplify';
import RoundCheckbox from 'rn-round-checkbox';

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      retry: '',
      login: false,
      consent: false,
      confirmCode: '',
      waitingConfirm: false,
    };
    this.processSignUp = this.processSignUp.bind(this);
    this.confirmSignUp = this.confirmSignUp.bind(this);
  }

  processSignUp() {
    console.log(this.state.password);
    if (this.state.consent) {
      Auth.signUp({
        username: this.state.username,
        password: this.state.password,
        attributes: {
          email: this.state.email,
        },
      })
        .then(data => {
          console.log('successful sign up: ' + data)
          this.setState({waitingConfirm: true});
        })
        .catch(err => console.log('failure to sign up: ' + err));
    }

  }
 
  confirmSignUp() {
    Auth.confirmSignUp(this.state.username, this.state.confirmCode)
      .then(()=>{
        console.log("successful confirmation sign up");
        this.setState({waitingConfirm: false})
      }
      )
      .then(err => console.log('failure confirm sign up: ' + err));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Sign Up</Text>

        {!this.state.waitingConfirm &&
        <View>
        <View style={{ backgroundColor: '#FDFEFE' }}>
          <TextInput
            style={{ height: 60 }}
            placeholder="Username"
            textContentType="username"
            onChangeText={username => this.setState({ username })}
          />
        </View>

        <View style={{ backgroundColor: '#FDFEFE' }}>
          <TextInput
            style={{ height: 60 }}
            placeholder="Password"
            secureTextEntry={true}
            textContentType="password"
            onChangeText={password => this.setState({ password })}
          />
        </View>

        <View style={{ backgroundColor: '#FDFEFE' }}>
          <TextInput
            style={{ height: 60 }}
            placeholder="Email"
            onChangeText={email => this.setState({ email })}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View>
            <RoundCheckbox
              size = {24}
              checked={this.state.consent}
              onValueChange={value => {
                this.setState({ consent: value });
              }}
            />
          </View>
          <View>
            <Text style={{ fontSize: 16, color: 'white' }}>
              I have read and agree to the terms and conditions as stated in the
              consent form.
            </Text>
          </View>
        </View>

        <View styles={{}}>
          <Button
            title="Sign Up"
            onPress={() =>
              this.processSignUp()
            }
          />
        </View>
        </View>
      }

      {
        /* If the user has already entered new username+ password, wait for confirmation code*/ 
        this.state.waitingConfirm && 
        <View>
          <View style={{ backgroundColor: '#FDFEFE' }}>
            <TextInput
              style={{ height: 60 }}
              placeholder="Confirmation Code"
              secureTextEntry={true}
              onChangeText={confirmCode => this.setState({ confirmCode })}
            />
          </View>

          <View styles={{}}>
            <Button
              title="Confirm Sign Up"
              onPress={() => this.confirmSignUp()}
            />
          </View>


          {this.state.retry === true && (
            <View>
              <Text
                style={{
                  color: 'red',
                  fontSize: 18,
                  textAlign: 'center',
                }}>
                Incorrect credentials
              </Text>
            </View>
          )}
        </View>
      }
      
      

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#2C2F33',
    padding: 8,
  },
  paragraph: {
    color: 'white',
    margin: 24,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
