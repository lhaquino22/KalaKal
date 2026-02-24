import { StyleSheet } from 'react-native';

const estilo = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderColor: 'ghostwhite',
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    image: {
        width: '90%',
        height: '90%',
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