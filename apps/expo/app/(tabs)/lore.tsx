import React, {useState, useRef, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import {api} from "@/utils/api";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/** Public R2 bucket URL (enable public access in the dashboard, or use a custom domain). */
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');

export const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'Daily':
      return '#2196f3';
    case 'Weekly':
      return '#4CAF50';
    case 'Monthly':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

export default function RecapsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const allRecaps = api.recaps.getAll.useQuery(undefined, {});
  const loadingHeight = useRef(new Animated.Value(0)).current;
  const [selectedRecap, setSelectedRecap] = useState<number | null>(null);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRecapPress = (recapId: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedRecap(recapId);
    
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 180,
      friction: 15,
      useNativeDriver: true,
      restSpeedThreshold: 100,
      restDisplacementThreshold: 40,
    }).start(() => {
      setIsAnimating(false);
    });
  };

  const handleClose = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    Animated.spring(slideAnim, {
      toValue: width,
      tension: 180,
      friction: 15,
      useNativeDriver: true,
      restSpeedThreshold: 100,
      restDisplacementThreshold: 40,
    }).start(() => {
      setSelectedRecap(null);
      setIsAnimating(false);
    });
  };

  const handleGesture = ({ nativeEvent }: { nativeEvent: { translationX: number; state: number } }) => {
    const { translationX, state } = nativeEvent;
    if (state === State.END && translationX > 50) {
      handleClose();
    }
  };

  useEffect(() => {
    Animated.timing(loadingHeight, {
      toValue: refreshing ? 50 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [refreshing]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await allRecaps.refetch();
    setRefreshing(false);
  }, [allRecaps]);

  const renderDetailView = () => {
    if (!selectedRecap || !allRecaps.data) return null;

    const recap = allRecaps.data.find(r => r.id === selectedRecap);
    if (!recap) return null;

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          activeOffsetX={[-20, 20]}
          failOffsetY={[-20, 20]}
          onHandlerStateChange={handleGesture}
        >
          <View style={styles.detailContent}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#F5F5F5" />
            </TouchableOpacity>
            
            <ScrollView>
              <View style={styles.detailImageContainer}>
                {recap.imageId && (
                  <Image 
                    source={{ uri: `${R2_PUBLIC_URL}/${recap.imageId}` }}
                    style={styles.detailImage}
                    defaultSource={require('../../assets/images/placeholder.png')}
                  />
                )}
              </View>
              
              <View style={styles.detailContentInner}>
                <View style={styles.detailHeaderContent}>
                  <Text style={styles.detailDate}>
                    {recap.createdAt.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeBadgeColor(recap.type) }
                  ]}>
                    <Text style={styles.typeBadgeText}>{recap.type}</Text>
                  </View>
                </View>
                <Text style={styles.detailText}>{recap.text}</Text>
              </View>
            </ScrollView>
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.loadingContainer,
        {
          height: loadingHeight,
          overflow: 'hidden',
        }
      ]}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor="transparent"
          />
        }
      >
        {allRecaps.data?.map((recap) => (
          <TouchableOpacity
            key={recap.id}
            style={styles.recapCard}
            onPress={() => handleRecapPress(recap.id)}
            activeOpacity={0.6}
          >
            {recap.imageId && (
              <Image
                source={{ uri: `${R2_PUBLIC_URL}/${recap.imageId}` }}
                style={styles.recapImage}
                defaultSource={require('../../assets/images/placeholder.png')}
              />
            )}
            <View style={styles.recapDetails}>
              <View
                style={[
                  styles.typeBadge,
                  {backgroundColor: getTypeBadgeColor(recap.type)}
                ]}
              >
                <Text style={styles.typeBadgeText}>{recap.type}</Text>
              </View>
              <Text style={styles.recapDate}>
                {recap.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {allRecaps.data?.length === 0 && (
          <Text style={styles.emptyStateText}>No Recaps Yet</Text>
        )}

        {allRecaps.isLoading && (
          <Text style={styles.loadingText}>Loading Recaps...</Text>
        )}
      </ScrollView>

      <Animated.View
        style={[
          styles.detailView,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {selectedRecap && renderDetailView()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollViewContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  recapCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  recapImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2A2A2A',
  },
  recapImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#2A2A2A',
  },
  recapDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recapDate: {
    color: '#F5F5F5',
    fontSize: 14,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#F5F5F5',
    marginTop: 50,
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#F5F5F5',
    marginTop: 50,
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'flex-start',
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  loadingInner: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  detailView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#121212',
    zIndex: 1000,
  },
  detailContent: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1001,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  detailImageContainer: {
    width: '110%',
    height: 400,
    marginLeft: '-5%',
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  detailContentInner: {
    padding: 16,
  },
  detailHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 16,
    color: "#F5F5F5",
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#F5F5F5",
  },
  imagePlaceholder: {
    backgroundColor: "#2A2A2A",
  },
  animatedImage: {
    position: 'absolute',
    zIndex: 1001,
  },
});