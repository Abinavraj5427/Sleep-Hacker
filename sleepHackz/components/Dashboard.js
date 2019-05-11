import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Button,
  Platform,
  TimePickerAndroid,
  DatePickerIOS,
  Vibration,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {Accelerometer} from 'expo';
import {Auth, Storage} from 'aws-amplify';
import Survey from './Survey';
import { Audio } from 'expo';

export default class Dashboard extends React.Component {
 

  constructor(props) {
    super(props);
    this.state = {
      chosenDate: new Date(),
      hour: 0,
      minute: 0,
      curTime: '',
      curHour: new Date().getHours(),
      curMin: new Date().getMinutes(),
      ring: false,
      accelerometerData: {},
      accelerometerList: [],
      surveyOn: false,
      timeStart: false,
    };
    this.setDate = this.setDate.bind(this);
    this.androidSetTime = this.androidSetTime.bind(this);
    this.format = this.format.bind(this);
    this.checkAlarm = this.checkAlarm.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.updateSurvey = this.updateSurvey.bind(this);
  }

  alarm = new Audio.Sound();

  updateSurvey(val){
    console.log(val);
    this.setState({surveyOn: val});
  }

  onLogout(){
    Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err));

    this.props.handleLogin(null);
  }
  async checkAlarm() {
    if (
      this.state.hour === this.state.curHour &&
      this.state.curMin === this.state.minute
    ) {
      //console.log(this.state.curHour+ " "+this.state.curMin+" "+ this.state.hour+ " " + this.state.minute)
      Vibration.vibrate(10000, false);
      this.setState({ ring: true });
      try {
        await this.alarm.loadAsync(require('../audio/tornadoSiren.mp3'));
        await this.alarm.playAsync();
        // Your sound is playing!
      } catch (error) {
        // An error occurred!
        console.err(error);
      }
    }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        curTime: new Date().toLocaleString(),
        curHour: new Date().getHours(),
        curMin: new Date().getMinutes(),
      });
      this.checkAlarm();
    }, 60000);
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener(
      accelerometerData => {

        //updates the current x, y, and z positions
        this.setState({ accelerometerData });

       
        if(this.state.timeStart){
          //Updates the acceleromter historical list every second
          let list = this.state.accelerometerList;

          list.push({
            x: this.state.accelerometerData.x , 
            y: this.state.accelerometerData.y ,
            z: this.state.accelerometerData.z ,
          });
          this.setState({acceleromteerList: list});
        }
      }
    ); 
    
  }

  format(hour, minute) {
    var string = '';
    var time = '';
    time = hour > 12 ? 'PM' : 'AM';
    hour = hour > 12 ? hour - 12 : hour;
    hour = hour === 0 ? 12 : hour;
    string += hour + ':';
    if (minute < 10) string += '0' + minute;
    else string += minute;
    return string + ' ' + time;
  }

  async androidSetTime() {
    try {
      const options = { is24Hour: false };
      const { action, hour, minute } = await TimePickerAndroid.open(options);
      if (action === TimePickerAndroid.timeSetAction) {
        this.setState({ hour: hour, minute: minute });
      }
    } catch ({ code, message }) {
      console.warn('Cannot open time picker', message);
    }
  }

  setDate(newDate) {
    this.setState({
      chosenDate: newDate,
      hour: newDate.getHours(),
      minute: newDate.getMinutes(),
    });
  }

  render() {
   //console.log(this.accelerometerList);
    let {
      x, y, z
    } = this.state.accelerometerData;
    var timeSet;
    const platform = Platform.OS;
    if (platform === 'ios') {
      timeSet = (
        <DatePickerIOS
          date={this.state.chosenDate}
          onDateChange={this.setDate}
        />
      );
    } else if (platform === 'android') {
      timeSet = (
        <TouchableOpacity
          style={{
            width: 75,
            height: 75,
            borderRadius: 100,
            backgroundColor: '#2FFFFF',
            fontColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            this.androidSetTime();
          }}
        >
        <Text>Set Time</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-around',
          backgroundColor: '#2C2F33',
          alignItems:'center',
        }}>

        {!this.state.surveyOn &&
        <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-around',}}>
        <StatusBar hidden={true} />
     
     
        <View 
      style={{
          flex: 2,
          marginTop: 50,
          backgroundColor: '#2C2F33',
          alignItems:'center',
        }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 40,
              color: 'red',
            }}>
            Alarm
          </Text>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 48,
              color: 'white',
            }}>
            SET: {this.format(this.state.hour, this.state.minute)}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 48,
              color: 'white',
            }}>
            CUR: {this.format(this.state.curHour, this.state.curMin)}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              color: 'red',
            }}>
            {this.state.timeStart? "Alarm On":"Alarm Off"}
          </Text>
        </View>

      <View 
      style={{
          flex: 2,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          backgroundColor: '#2C2F33',
          alignItems:'center',
        }}>
       <TouchableOpacity
          style={{
            width: 75,
            height: 75,
            borderRadius: 100,
            backgroundColor: '#2FFFFF',
            fontColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            Vibration.cancel();
            this.alarm.stopAsync();
            if(this.state.timeStart){
              this.setState({ ring: false, surveyOn: true, timeStart: false});
              convertToCSV(this.state.accelerometerList);
            }
          }}
        >
        <Text>Stop Alarm</Text>
        </TouchableOpacity>

        {timeSet}

        <TouchableOpacity
          style={{
            width: 75,
            height: 75,
            borderRadius: 100,
            backgroundColor: '#2FFFFF',
            fontColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            this.setState({timeStart: true});
            console.log("Started");
          }}
        >
        <Text>Start Sleep</Text>
        </TouchableOpacity>
      </View>

     
      <View 
      style={{
          flex: 2,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          backgroundColor: '#2C2F33',
          alignItems:'center',
        }}>
           <TouchableOpacity
          style={{
            width: 75,
            height: 75,
            borderRadius: 100,
            backgroundColor: '#2FFFFF',
            alignItems:'center',
            justifyContent: 'center',
            fontColor: 'red',
          }}
          onPress={() => {this.onLogout()}}>
          <Text>Logout</Text>
        </TouchableOpacity>
          </View>


        </View>
        }


        {this.state.surveyOn &&  <Survey updateSurvey = {(val) => this.updateSurvey(val)}/>}
      </View>
    );
  }
}

function convertToCSV(list){
  const {Parser} = require("json2csv");
  const fields = ["x","y","z"]
  const jsonParser = new Parser({fields});
  const csv = jsonParser.parse(list);

  Storage.put(''+(new Date().toISOString())+'.csv', csv, {
     level: 'private',
     contentType: 'text/plain'
  })
 .then (result => console.log(result))
 .catch(err => console.log(err));

}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

// const audioOptions = {
//   source: { local: require('../audio/tornadoSiren.mp3') }, //ex. require('./music/sample.mp3')
// };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
