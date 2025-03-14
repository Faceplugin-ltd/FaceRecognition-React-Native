import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';

const PersonView = ({ personList, deletePerson }) => {
    const renderItem = ({ item, index }) => {
        return (            
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${item.faceJpg}` }}
                        style={styles.avatar}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subtitle}>Registered Face</Text>
                </View>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deletePerson(index)}
                >
                    <Image
                        source={require('./assets/ic_delete.png')}
                        style={styles.buttonIcon}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <FlatList
            data={personList}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#63317B',
        borderRadius: 12,
        marginBottom: 12,
    },
    avatarContainer: {
        marginLeft: 16,
        padding: 2,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    contentContainer: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 13,
        opacity: 0.7,
    },
    deleteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        padding: 8,
    },
    buttonIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
});

export default PersonView;
