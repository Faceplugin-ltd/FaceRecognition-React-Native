// ResultPage.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

const ResultPage = ({ navigation, route }) => {
  const [showDetails, setShowDetails] = useState(false);

  //   // add demo data for the below parms
  //   const tempPhoto = 'https://picsum.photos/200/300';

  //   const enrolledFace = tempPhoto;
  //   const identifiedFace = tempPhoto;
  //   const maxSimilarityName = 'John Doe';
  //   const maxSimilarity = 0.98;
  //   const maxLiveness = 0.95;
  //   const maxYaw = 10;
  //   const maxRoll = 5;
  //   const maxPitch = 2;

  const {
    enrolledFace,
    identifiedFace,
    maxSimilarityName,
    maxSimilarity,
    maxLiveness,
    maxYaw,
    maxRoll,
    maxPitch,
  } = route.params;

  const goBackToHome = () => {
    navigation.goBack();
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={goBackToHome}>
          <Image
            style={styles.navIcon}
            source={require('./assets/ic_arrow_left.png')}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Identify Result</Text>

      <View style={styles.imagesContainer}>
        <View style={styles.imageCard}>
          <Image
            style={styles.faceImage}
            source={{ uri: `data:image/jpeg;base64,${identifiedFace}` }}
          />
          <Text style={styles.imageLabel}>Identified</Text>
        </View>

        <View style={styles.imageCard}>
          <Image
            style={styles.faceImage}
            source={{ uri: `data:image/jpeg;base64,${enrolledFace}` }}
          />
          <Text style={styles.imageLabel}>Enrolled</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailsButton} onPress={toggleDetails}>
        <Text style={styles.detailsButtonText}>Details</Text>
      </TouchableOpacity>

      <Modal
        visible={showDetails}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Details</Text>
            <View style={styles.modalBody}>
              <Text style={styles.detailText}>Similarity: {maxSimilarity}</Text>
              <Text style={styles.detailText}>
                Liveness score: {maxLiveness}
              </Text>
              <Text style={styles.detailText}>Yaw: {maxYaw}°</Text>
              <Text style={styles.detailText}>Roll: {maxRoll}°</Text>
              <Text style={styles.detailText}>Pitch: {maxPitch}°</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleDetails}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* <View style={styles.navigationBar}>
        <TouchableOpacity onPress={goBackToHome}>
          <Image
            style={styles.navIcon}
            source={require('./assets/ic_arrow_left.png')}
          />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <View style={styles.navIndicator} />
        </View>
        <View style={styles.navRight} />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  imagesContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  faceImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
  },
  idLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  detailsButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationBar: {
    position: 'absolute',
    top: 8,
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1C1B1F',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  navRight: {
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 20,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultPage;
