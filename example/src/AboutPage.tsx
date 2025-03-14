// AboutPage.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';

const AboutPage = ({ navigation }) => {
  const goBackToHome = () => {
    navigation.goBack();
  };

  const handlePress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBackToHome}
        >
          <Image 
            style={styles.backIcon}
            source={require('./assets/ic_arrow_left.png')}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Faceplugin Ltd</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Image 
            source={require('./assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              We are a leading provider of face recognition and liveness detection solutions. Our technology is designed to provide secure and reliable biometric authentication for various applications.
            </Text>
            <Text style={styles.description}>
              With our advanced SDKs and expertise in computer vision, we help businesses implement robust facial recognition systems.
            </Text>
          </View>

          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            
            <TouchableOpacity 
              style={styles.contactRow}
              onPress={() => handlePress('mailto:info@faceplugin.com')}
            >
              <View style={styles.iconContainer}>
                <Image source={require('./assets/ic_email.png')} style={styles.icon} />
              </View>
              <Text style={styles.contactText}>info@faceplugin.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactRow}
              onPress={() => handlePress('https://t.me/faceplugin')}
            >
              <View style={styles.iconContainer}>
                <Image source={require('./assets/ic_telegram.png')} style={styles.icon} />
              </View>
              <Text style={styles.contactText}>@faceplugin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactRow}
              onPress={() => handlePress('https://wa.me/14422295661')}
            >
              <View style={styles.iconContainer}>
                <Image source={require('./assets/ic_whatsapp.png')} style={styles.icon} />
              </View>
              <Text style={styles.contactText}>+1 442-229-5661</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactRow}
              onPress={() => handlePress('https://github.com/Faceplugin-ltd')}
            >
              <View style={styles.iconContainer}>
                <Image source={require('./assets/ic_github.png')} style={styles.icon} />
              </View>
              <Text style={styles.contactText}>github.com/Faceplugin-ltd</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
    );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
  },
  appBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1C1B1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  logo: {
    width: '100%',
    height: 140,
    marginBottom: 32,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.9,
  },
  contactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default AboutPage;