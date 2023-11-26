/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
} from "react-native";

const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.75;
const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

type Props = {
  children: JSX.Element;
  onRequestClose: () => void;
  swipeToCloseEnabled?: boolean;
};

const ViewItem = ({
  swipeToCloseEnabled = true,
  children,
  onRequestClose,
}: Props) => {
  const scrollValueY = new Animated.Value(0);

  const imageOpacity = scrollValueY.interpolate({
    inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
    outputRange: [0.5, 1, 0.5],
  });

  const onScrollEndDrag = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityY = nativeEvent?.velocity?.y ?? 0;
      const scaled = nativeEvent?.zoomScale > 1;

      if (
        !scaled &&
        swipeToCloseEnabled &&
        Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY
      ) {
        onRequestClose();
      }
    },
    [],
  );

  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    if (nativeEvent?.zoomScale > 1) {
      return;
    }

    scrollValueY.setValue(offsetY);
  };

  return (
    <SafeAreaView>
      <Animated.ScrollView
        style={styles.listItem}
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.imageScrollContainer}
        scrollEnabled={swipeToCloseEnabled}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={1}
        {...(swipeToCloseEnabled && {
          onScroll,
        })}
      >
        <Animated.View style={{ opacity: imageOpacity }}>
          {children}
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
});

export default React.memo(ViewItem);
