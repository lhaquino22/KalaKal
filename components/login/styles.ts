import { StyleSheet } from 'react-native';
import { colors } from '@/commons';

export default StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain'
  },
  buttons: {
    marginTop: 10,
    width: 200,
    height: 30,
    resizeMode: 'contain'
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 5,
    width: 200,
    alignItems: 'center'
  },
  buttonText: {
    color: colors.mainColor,
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonsContainer: {
    marginTop: 20
  },
  inputContainer: {
    width: 300
  },
  textInput: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    width: 300,
    height: 40,
    alignSelf: 'stretch',
    color: 'white',
    fontSize: 16
  },
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#FF375F',
  },
  registerLink: {
    marginTop: 15
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  errorText: {
    color: '#FF375F',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 0,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  registerForm: {
    paddingVertical: 30
  },

  keyboardAvoidingContainer: {
    flex: 1
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1
  }
})