import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { FaceRecognitionSdkView, FaceSDKModule } from 'face-recognition-sdk';
import SQLite from 'react-native-sqlite-storage';
import PersonView from './PersonView';
import Person from './Person';

const FaceRecognitionScreen = ({ navigation }) => {
  const [registeredUsers, setRegisteredUsers] = useState<Person[]>([]);

  useEffect(() => {
    console.log('user effect');
    // This function will be executed after the component is mounted
    const initSDKAsync = async () => {
      try {
        if (Platform.OS == 'ios') {
          var ret = await FaceSDKModule.setActivation(
            'ZxU5Xu7XDitkVZ2y6ooEnkM2aianIE0MC8DncGam0djE+QHVQuNClk+9yJkEElg3zj6KSmloIUbcIYzayCmjdqT/qLCpNg4IHx4CuMOSHuafQLDFFSh/C3pU8sfAHn5f57dXKRPS73tSN52hTlQOZtl99J+47U8oShMmcruG6IdWKj//8ZQm3KkiOAxMZ7IOeoj3lRBnWPr4aZeLDTll9jtNqhIW5S1ElUI8R7ViJiJiHgw0FHwqkQAXXcoUly84HuDr4/W7OGNi7yBfOug21TNgCkHc5yaaerRzqEsAFq61YHlAFNmGhNFhscGEqPfROwcU1BLb1HwbrJQCsZJDjQ=='
          );
          console.log('set activation:', ret);
        } else {
          var ret = await FaceSDKModule.setActivation(
            'EGH+RzwjnvhbtLxq49y1nDDSxguXUZPkgifx/9EGeg3qGrrnsZbP4/nQH1hE/BQyt86UqMByIaUuoqUvJORHPnJBOFSkEIEL4GX1FQjMzDZabA/V2HmkEaY9hAXlIkd4aDAdy7YI37hqfGgvsg8OgSi12aM7ScyHwzC/mbFkTSMHMM/+nB9aWBaO79nCSRWQfpOoQjh823fCwVIJc7YPLxJJjlPZaTASx1DPnoZ8qaCl7tVJpmGIwgTlJq/0ywLrok+q6usCkERqVGloab3O4YcfpZ1Pw7kvUjBvGsR5eWaMzS+xx1tlLvcv0F0pRhJeBRln+2Th57AeNMxXFLxfyQ=='
          );
          console.log('set activation:', ret);
        }

        ret = await FaceSDKModule.initSDK();

        console.log('init sdk:', ret);
      } catch (error) {
        console.error('Error setting activation:', error);
      }
    };

    const initializeDatabase = () => {
      // Create or open the database
      const db = SQLite.openDatabase(
        { name: 'person1.db', location: 'default' },
        () => {},
        errorCB
      );

      // Create the table if it doesn't exist
      db.transaction((tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS person(name text, faceJpg text, templates text)',
          [],
          () => console.log('Table created or already exists'),
          (error) => console.log('Error creating table:', error)
        );
      });
    };

    initSDKAsync();
    initializeDatabase();
    fetchRegisteredUsers();

    // Return a cleanup function to unsubscribe or perform cleanup
    return () => {
      // console.log('Component unmounted');
    };
  }, []); // The empty dependency array ensures the effect runs only once

  const errorCB = (err) => {
    console.log('SQL Error: ' + err);
  };

  const fetchRegisteredUsers = async () => {
    try {
      const db = SQLite.openDatabase(
        { name: 'person1.db', location: 'default' },
        () => {},
        errorCB
      );

      await db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM person',
          [],
          (_, result) => {
            const rows = result.rows;
            const persons = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              console.log('person: ', row.name);
              persons.push({
                name: row.name,
                faceJpg: row.faceJpg,
                templates: row.templates,
              });
            }
            setRegisteredUsers(persons as Person[]);
          },
          (error) => {
            console.log('Error loading persons:', error);
          }
        );
      });
    } catch (error) {
      console.log('Error opening database:', error);
    }
  };

  const addUserToDatabase = async (userData: Person) => {
    try {
      const db = SQLite.openDatabase(
        { name: 'person1.db', location: 'default' },
        () => {},
        errorCB
      );

      await db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO person (name, faceJpg, templates) VALUES (?, ?, ?)',
          [userData.name, userData.faceJpg, userData.templates],
          (_, result) => {
            setRegisteredUsers([...registeredUsers, userData]);
            console.log('Person inserted successfully1');
          },
          (error) => {
            console.log('Error inserting person:', error);
          }
        );
      });
    } catch (error) {
      console.log('Error opening database:', error);
    }
  };

  const removeUserFromDatabase = async (index) => {
    try {
      const db = SQLite.openDatabase(
        { name: 'person1.db', location: 'default' },
        () => {},
        errorCB
      );

      const userData = registeredUsers[index];

      await db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM person WHERE name = ?',
          [userData.name],
          (_, result) => {
            console.log('Person deleted successfully');
            const updatedUsers = [...registeredUsers];
            updatedUsers.splice(index, 1);
            setRegisteredUsers(updatedUsers);
          },
          (error) => {
            console.log('Error deleting person:', error);
          }
        );
      });
    } catch (error) {
      console.log('Error opening database:', error);
    }
  };

  const processUserRegistration = async (uri) => {
    var faceBoxes = await FaceSDKModule.extractFaces(uri);
    console.log('faceBoxes', faceBoxes);
    faceBoxes.forEach((face) => {
      const randomNumber = 10000 + Math.floor(Math.random() * 10000); // Generate a random number between 10000 and 19999
      const userData = {
        name: 'User' + randomNumber.toString(),
        faceJpg: face.faceJpg,
        templates: face.templates,
      };

      addUserToDatabase(userData);
    });
  };

  const initiateUserEnrollment = async () => {
    var options = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.log('Error code:', response.errorCode);
        return;
      }

      console.log('Selected image:', response.assets[0]?.uri);
      processUserRegistration(response.assets[0]?.uri);
    });
  };

  const goToFaceRecognition = () => {
    navigation.navigate('FaceRecognition', { persons: registeredUsers });
  };

  const goToAbout = () => {
    navigation.navigate('About');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2F4F" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Face Recognition</Text>
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => goToAbout()}
          >
            <Image
              source={require('./assets/information.png')}
              style={styles.aboutIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        {/* <View style={styles.featureCard}>
          <Text style={styles.featureText}>
            Face Recognition, Liveness Detection, and ID Card Recognition
          </Text>
        </View> */}

        <View style={styles.actionSection}>
          <View style={styles.buttonsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={initiateUserEnrollment}
            >
              <View style={styles.buttonIconContainer}>
                <Image
                  source={require('./assets/enroll.png')}
                  style={styles.buttonIcon}
                />
              </View>
              <Text style={styles.buttonText}>ENROLL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={goToFaceRecognition}
            >
              <View style={styles.buttonIconContainer}>
                <Image
                  source={require('./assets/identify.png')}
                  style={styles.buttonIcon}
                />
              </View>
              <Text style={styles.buttonText}>IDENTIFY</Text>
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => goToAbout()}
            >
              <View style={styles.buttonIconContainer}>
                <Image
                  source={require('./assets/information.png')}
                  style={styles.buttonIcon}
                />
              </View>
              <Text style={styles.buttonText}>ABOUT</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {registeredUsers.length > 0 && (
          <View style={styles.registeredSection}>
            <Text style={styles.sectionTitle}>ENROLLED FACES</Text>
            <View style={styles.personListContainer}>
              <PersonView
                personList={registeredUsers}
                deletePerson={removeUserFromDatabase}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252525',
  },
  header: {
    backgroundColor: '#252525',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  aboutButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  aboutIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerLogo: {
    width: 280,
    height: 56,
    resizeMode: 'contain',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  featureCard: {
    backgroundColor: '#303033',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  actionSection: {
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#63317B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    width: '90%',
    height: '90%',
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  registeredSection: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  personListContainer: {
    marginTop: 16,
    flex: 1,
    backgroundColor: '#303033',
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
});

export default FaceRecognitionScreen;
