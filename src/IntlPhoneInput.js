import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import data from './Countries';

const defaultMask = '999 999 9999';

export default class IntlPhoneInput extends React.Component {
  constructor(props) {
    super(props);
    const selectedCountry = data.filter((obj) => obj.dialCode === props.dialCode)[0];
    const defaultValue = props.defaultValue;
    const defaultCountry = data.filter((obj) => obj.dialCode === '+965')[0];
    console.log(selectedCountry);
    console.log(defaultCountry);
    this.state = {
      defaultCountry,
      flag:selectedCountry ? selectedCountry.flag :defaultCountry.flag,
      modalVisible: false,
      dialCode: selectedCountry ? selectedCountry.dialCode :defaultCountry.dialCode,
      phoneNumber: defaultValue,
      mask: selectedCountry ? selectedCountry.mask:defaultMask,
      countryData: data,
      selectedCountry:selectedCountry
    };
  }

  onChangePropText=(unmaskedPhoneNumber, phoneNumber) => {
    const { dialCode, mask,selectedCountry } = this.state;
    const countOfNumber = mask && mask.match(/9/g).length;
    console.log(`unmaskedPhoneNumber ${unmaskedPhoneNumber}`);
    console.log(`phoneNumber ${phoneNumber}`);
    console.log(`mask ${mask}`);
    console.log(`countOfNumber ${countOfNumber}`);
    if (this.props.onChangeText) {
      const isVerified = countOfNumber === unmaskedPhoneNumber?.length && phoneNumber?.length > 0;
      this.props.onChangeText({
        dialCode, unmaskedPhoneNumber, phoneNumber, isVerified,selectedCountry
      });
    }
  }

  onChangeText = (value) => {
    console.log(`value ${value}`);
    let unmaskedPhoneNumber = (value.match(/\d+/g) || []).join('');
    console.log(`unmaskedPhoneNumber ${unmaskedPhoneNumber}`);
    if (unmaskedPhoneNumber.length === 0) {
      this.setState({ phoneNumber: '' });
      this.onChangePropText('', '');
      return;
    }

    console.log(`this.state.mask ${this.state.mask}`);
    let phoneNumber =   this.state.mask && this.state.mask.replace(/9/g, '_');
    console.log(`phoneNumber ${phoneNumber}`);
    for (let index = 0; index < unmaskedPhoneNumber.length; index += 1) {
      phoneNumber = phoneNumber.replace('_', unmaskedPhoneNumber[index]);
    }
 

    let numberPointer = 0;
    console.log(phoneNumber);
    if(phoneNumber){
    for (let index = phoneNumber.length; index > 0; index -= 1) {
      if (phoneNumber[index] !== ' ' && !isNaN(phoneNumber[index])) {
        numberPointer = index;
        break;
      }
    }

    phoneNumber = phoneNumber.slice(0, numberPointer + 1);
    unmaskedPhoneNumber = (phoneNumber.match(/\d+/g) || []).join('');
  }

    this.onChangePropText(unmaskedPhoneNumber, phoneNumber);
    this.setState({ phoneNumber });
  }


  showModal = () => (this.props.disableCountryChange ? null : this.setState({ modalVisible: true }));

  hideModal = () => this.setState({ modalVisible: false, countryData: data });

  onCountryChange = async (code) => {
    const {updateDialCode} = this.props;
    const countryData = await data;
    try {
      const country = await countryData.filter((obj) => obj.code === code)[0];
      this.setState({
        dialCode: country.dialCode,
        flag: country.flag,
        mask: country.mask,
        phoneNumber: '',
        selectedCountry:country
      });
      this.hideModal();
      updateDialCode(country.dialCode);
    } catch (err) {
      const selectedCountry = this.state.selectedCountry;
      this.setState({
        dialCode: selectedCountry.dialCode,
        flag: selectedCountry.flag,
        mask: selectedCountry.mask,
        phoneNumber: '',
        selectedCountry:selectedCountry
      });
      updateDialCode(selectedCountry.dialCode);
    }
  }

  filterCountries = (value) => {
   const { lang
  } = this.props;
    const countryData = data.filter((obj) => (obj[lang?.toLowerCase()??"en"]?.indexOf(value) > -1 || obj.dialCode.indexOf(value) > -1));
    this.setState({ countryData });
  }

  focus() {
    this.props.inputRef.current.focus();
  }

  renderModal=() => {
    if (this.props.customModal) return this.props.customModal(this.state.modalVisible,this.state.countryData,this.onCountryChange);
    const {
      countryModalStyle,
      modalContainer,
      modalFlagStyle,
      filterInputStyle,
      modalCountryItemCountryNameStyle,
      modalCountryItemCountryDialCodeStyle,
      closeText,
      filterText,
      searchIconStyle,
      closeButtonStyle,
      lang
    } = this.props;
    console.log(this.state.countryData);
    return (
      <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}>
        <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.modalContainer, modalContainer]}>
          <View style={styles.filterInputStyleContainer}>
            <TextInput autoFocus onChangeText={this.filterCountries} placeholder={filterText || 'Filter'} style={[styles.filterInputStyle, filterInputStyle]} />
          </View>
          {(this.state.countryData.length > 0)?
          (<FlatList
            style={{ flex: 1 }}
            data={this.state.countryData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={
          ({ item }) => (
            <TouchableWithoutFeedback onPress={() => this.onCountryChange(item.code)}>
              <View style={[styles.countryModalStyle, countryModalStyle]}>
                <Text style={[styles.modalFlagStyle, modalFlagStyle]}>{item.flag}</Text>
                <View style={styles.modalCountryItemContainer}>
                  <Text style={[styles.modalCountryItemCountryNameStyle, modalCountryItemCountryNameStyle]}>{item[lang?.toLowerCase()??"en"]}</Text>
                  <Text style={[styles.modalCountryItemCountryDialCodeStyle, modalCountryItemCountryDialCodeStyle]}>{`  ${item.dialCode}`}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )
        }
          />)
          :
          (
            <Text style={styles.modalCountryItemCountryNameStyle}>No matching results found!</Text>
          )
      }
        </View>
        <TouchableOpacity onPress={() => this.hideModal()} style={[styles.closeButtonStyle, closeButtonStyle]}>
          <Text style={styles.closeTextStyle}>{closeText || 'CLOSE'}</Text>
        </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

renderAction=()=>{
  const renderAction=this.props.renderAction;
  if(renderAction) {
    console.log("action",renderAction);
    if(typeof renderAction!=="function") throw ("The renderAction is not a function. Please set a renderAction function on there");
    else return this.props.renderAction();
  }
  return null;
}

  render() {
    const { flag, defaultCountry } = this.state;
    const {
      containerStyle,
      flagStyle,
      phoneInputStyle,
      dialCodeTextStyle,
      inputProps
    } = this.props;
    return (
      <View style={{ ...styles.container, ...containerStyle }}>
        <TouchableOpacity onPress={() => this.showModal()}>
          <View style={styles.openDialogView}>
            <Text style={[styles.flagStyle, flagStyle]}>{flag}</Text>
            <Text style={[styles.dialCodeTextStyle, dialCodeTextStyle]}>{this.state.dialCode}</Text>
          </View>
        </TouchableOpacity>
        {this.renderModal()}
        <TextInput
          {...inputProps}
          style={[styles.phoneInputStyle, phoneInputStyle]}
          placeholder={this.props.placeholder || (this.state.mask ? this.state.mask.replace(/9/g, '_'):defaultMask.replace(/9/g, '_'))}
          autoCorrect={false}
          keyboardType="number-pad"
          secureTextEntry={false}
          value={this.state.phoneNumber}
          onChangeText={this.onChangeText}
        />
        {this.renderAction()}

      </View>


    );
  }
}

IntlPhoneInput.propTypes = {
  lang: PropTypes.string,
  defaultCountry: PropTypes.string,
  onChangeText: PropTypes.func,
  customModal: PropTypes.func,
  phoneInputStyle: PropTypes.object, // {}
  containerStyle: PropTypes.object, // {}
  dialCodeTextStyle: PropTypes.object, // {}
  flagStyle: PropTypes.object, // {}
  modalContainer: PropTypes.object, // {}
  filterInputStyle: PropTypes.object, // {}
  closeButtonStyle: PropTypes.object, // {}
  modalCountryItemCountryNameStyle: PropTypes.object, // {}
  filterText: PropTypes.string,
  closeText: PropTypes.string,
  searchIconStyle: PropTypes.object,
  disableCountryChange: PropTypes.bool,
  inputRef: PropTypes.object,
  defaultValue: PropTypes.string,
};

const styles = StyleSheet.create({
  closeTextStyle: {
    padding: 5,
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    borderColor: 'black',
    borderWidth:1,
    borderRadius:3,
  },
  modalCountryItemCountryDialCodeStyle: {
    fontSize: 15
  },
  modalCountryItemCountryNameStyle: {
    flex: 1,
    fontSize: 15
  },
  modalCountryItemContainer: {
    flex: 1,
    paddingLeft: 5,
    flexDirection: 'row'
  },
  modalFlagStyle: {
    fontSize: 25,
  },
  modalContainer: {
    paddingTop: 15,
    paddingLeft: 25,
    paddingRight: 25,
    flex: 10,
    backgroundColor: 'white'
  },
  flagStyle: {
    fontSize: 35,
  },
  dialCodeTextStyle: {
    marginLeft:4,
    fontSize: 14,
    color: '#231F20',
  },
  countryModalStyle: {
    flex: 1,
    borderColor: 'black',
    borderTopWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  openDialogView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterInputStyle: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  searchIcon: {
    padding: 10,
  },
  filterInputStyleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderWidth:1,
    padding:1,
    borderColor: 'black',
    marginBottom:4,
  },
  phoneInputStyle: {
    marginLeft: 5,
    flex: 1,
    fontSize: 16,
    color: '#231F20',
  },
  container: {
    flexDirection: 'row',
    //paddingHorizontal: 12,
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchIconStyle: {
    color: 'black',
    fontSize: 15,
    marginLeft: 15
  },
  buttonStyle: {
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  countryStyle: {
    flex: 1,
    borderColor: 'black',
    borderTopWidth: 1,
    padding: 12,
  },
  closeButtonStyle: {
    padding: 12,
    alignItems: 'center',
  }
});
