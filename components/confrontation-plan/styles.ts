import { colors } from "@/commons";
import { StyleSheet } from "react-native";

const estilo = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    content: {
        flex: 1,
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    descricao: {
        fontSize: 15,
        color: colors.defaultTextColor,
        textAlign: 'justify',
        lineHeight: 22,
    },
    section: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    objectiveItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    objectiveText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tagText: {
        fontSize: 13,
        color: '#9A3412',
        fontWeight: '500',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        padding: 14,
        marginTop: 24,
        gap: 12,
    },
    downloadTextContainer: {
        flex: 1,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    downloadButtonSubtext: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        marginTop: 2,
    },
});

export default estilo;
