import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
  Modal,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { api } from "@/utils/api";
import { MaterialIcons } from '@expo/vector-icons';

const STYLES = [
  { 
    id: 'classical painting', 
    label: 'Classical Painting',
    image: require('@/assets/styles/classical.png')
  },
  { 
    id: 'ethereal animated fairy', 
    label: 'Ethereal Fairy',
    image: require('@/assets/styles/ethereal.png')
  },
  { 
    id: 'childrens book', 
    label: 'Children\'s Book',
    image: require('@/assets/styles/childrens.png')
  },
  { 
    id: '3d animated style', 
    label: '3D Animated',
    image: require('@/assets/styles/3d.png')
  },
] as const;

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const ITEM_HEIGHT = height * 0.65;
const SPACING = 15;

const getStyleById = (id: string | undefined) => {
  return STYLES.find(style => style.id === id) ?? STYLES[0];
};

export default function AccountPage() {
  const auth = useUser();
  const { user, isLoaded, isSignedIn } = auth;
  const { signOut } = useClerk();
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const utils = api.useContext();
  const preferences = api.user.getPreferences.useQuery();
  const updateStyle = api.user.updateArtStyle.useMutation({
    onSuccess: () => {
      utils.user.getPreferences.invalidate();
      // Animate back to account view after successful update
      setShowStyleSelector(false);
    },
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showStyleSelector) {
      Animated.spring(slideAnim, {
        toValue: -width,
        useNativeDriver: true,
        tension: 180,
        friction: 26,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 180,
        friction: 26,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }).start();
    }
  }, [showStyleSelector]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const handleStyleSelect = () => {
    const selectedStyle = STYLES[activeIndex].id;
    if (selectedStyle !== preferences.data?.artStyle) {
      updateStyle.mutate(selectedStyle);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.slidingContainer,
        { transform: [{ translateX: slideAnim }] }
      ]}>
        {/* Account View */}
        <View style={styles.page}>
          <Text style={styles.text}>Account Page</Text>
          <SignedIn>
            <View style={styles.content}>
              <Text style={styles.email}>Hello {user?.emailAddresses[0].emailAddress}</Text>
              
              <TouchableOpacity
                style={styles.styleButton}
                onPress={() => setShowStyleSelector(true)}
              >
                <View style={styles.styleButtonContent}>
                  <View style={styles.stylePreviewContainer}>
                    <Image
                      source={getStyleById(preferences.data?.artStyle).image}
                      style={styles.stylePreviewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.stylePreviewOverlay} />
                  </View>
                  <View style={styles.styleButtonText}>
                    <Text style={styles.styleButtonTitle}>Select an art style</Text>
                    <Text style={styles.currentStyle}>
                      {getStyleById(preferences.data?.artStyle).label}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSignOutModal(true)}
                style={styles.signOutButton}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </SignedIn>
          <SignedOut>
            <View style={styles.authLinks}>
              <Link href="/(auth)/sign-in">
                <Text>Sign In</Text>
              </Link>
              <Link href="/(auth)/sign-up">
                <Text>Sign Up</Text>
              </Link>
            </View>
          </SignedOut>
        </View>

        {/* Style Selector View */}
        <View style={styles.page}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => setShowStyleSelector(false)}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
              <Text style={styles.headerTitle}>Select Style</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              snapToInterval={ITEM_WIDTH + SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.scrollContent}
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / (ITEM_WIDTH + SPACING)
                );
                setActiveIndex(index);
              }}
            >
              {STYLES.map((style, index) => {
                const inputRange = [
                  (index - 1) * (ITEM_WIDTH + SPACING),
                  index * (ITEM_WIDTH + SPACING),
                  (index + 1) * (ITEM_WIDTH + SPACING),
                ];
                
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={style.id}
                    style={[
                      styles.styleCard,
                      { 
                        width: ITEM_WIDTH,
                        transform: [{ scale }],
                      },
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.imageWrapper}>
                        <Image
                          source={style.image}
                          style={styles.styleImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.styleText}>{style.label}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.selectButton,
              updateStyle.isPending && styles.loadingButton,
              preferences.data?.artStyle === STYLES[activeIndex].id && styles.selectedButton,
            ]}
            onPress={handleStyleSelect}
            disabled={updateStyle.isPending || preferences.data?.artStyle === STYLES[activeIndex].id}
          >
            {updateStyle.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : preferences.data?.artStyle === STYLES[activeIndex].id ? (
              <View style={styles.selectedContent}>
                <Text style={styles.selectButtonText}>Selected</Text>
                <MaterialIcons name="check" size={20} color="#fff" />
              </View>
            ) : (
              <Text style={styles.selectButtonText}>Select this style</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showSignOutModal}
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowSignOutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleSignOut}
                >
                  <Text style={styles.confirmButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    overflow: 'hidden',
  },
  slidingContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * 2,
  },
  page: {
    width,
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#F5F5F5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  text: {
    fontSize: 24,
    color: "#F5F5F5",
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 30,
    color: "#F5F5F5",
  },
  styleButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  styleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stylePreviewContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  stylePreviewImage: {
    width: '100%',
    height: '100%',
  },
  stylePreviewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  styleButtonText: {
    flex: 1,
  },
  styleButtonTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  currentStyle: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signOutText: {
    color: '#FF453A',
    fontWeight: '600',
    fontSize: 16,
  },
  authLinks: {
    alignItems: 'center',
    gap: 10,
  },
  carouselContainer: {
    flex: 1,
    position: 'relative',
  },
  styleCard: {
    marginHorizontal: SPACING / 2,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    width: '100%',
    height: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  styleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  styleText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#F5F5F5',
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  loadingButton: {
    backgroundColor: '#999',
  },
  selectedButton: {
    backgroundColor: '#34C759',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2 - SPACING / 2,
    paddingVertical: 20,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F5F5F5',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  confirmButton: {
    backgroundColor: '#FF453A',
  },
  cancelButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});