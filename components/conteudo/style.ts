import { StyleSheet } from 'react-native';
import { colors } from '../../commons';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.defaultBackgroundColor,
  },
  content: {
    padding: 20,
    margin: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  secao: {
    marginTop: 20,
  },
  secaoTitle: {
    marginBottom: 15,
    marginLeft: 20,
  },
  searchBar: {
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    color: colors.defaultTextColor,
    textAlign: 'justify',
    lineHeight: 22,
  },
  taxonomyContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  taxonomyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  taxonomyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  taxonomyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taxonomyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 90,
  },
  taxonomyValue: {
    fontSize: 14,
    color: colors.defaultTextColor,
    flex: 1,
    fontStyle: 'italic',
  },
});
