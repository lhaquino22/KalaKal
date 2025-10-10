import { StyleSheet } from 'react-native';

const estilo = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderColor: 'ghostwhite',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: '80%',
        height: '70%',
        resizeMode: 'contain'
    },
    title: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 10,
        color: '#666'
    }
});

export default estilo;