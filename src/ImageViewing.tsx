/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { ComponentType, useCallback, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ModalProps,
  StyleSheet,
  View,
  VirtualizedList,
} from "react-native";
import { ImageSource } from "./@types";
import ImageDefaultHeader from "./components/ImageDefaultHeader";
import ImageItem from "./components/ImageItem/ImageItem";
import StatusBarManager from "./components/StatusBarManager";
import ViewItem from "./components/ViewItem/ViewItem";
import useAnimatedComponents from "./hooks/useAnimatedComponents";
import useImageIndexChange from "./hooks/useImageIndexChange";
import useRequestClose from "./hooks/useRequestClose";

export interface ViewSource {
  type: "image" | "view";
  children?: JSX.Element;
  source?: ImageSource;
}

type Props = {
  views: ViewSource[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onLongPress?: (image: ViewSource) => void;
  onImageIndexChange?: (imageIndex: number) => void;
  presentationStyle?: ModalProps["presentationStyle"];
  animationType?: ModalProps["animationType"];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
};

const DEFAULT_ANIMATION_TYPE = "fade";
const DEFAULT_BG_COLOR = "#000";
const DEFAULT_DELAY_LONG_PRESS = 800;
const SCREEN = Dimensions.get("screen");
const SCREEN_WIDTH = SCREEN.width;

function ImageViewing({
  views,
  imageIndex,
  visible,
  onRequestClose,
  onLongPress = () => {},
  onImageIndexChange,
  animationType = DEFAULT_ANIMATION_TYPE,
  backgroundColor = DEFAULT_BG_COLOR,
  presentationStyle,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent,
  FooterComponent,
}: Props) {
  const imageList = useRef<VirtualizedList<ImageSource>>(null);
  const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
  const [currentImageIndex, onScroll] = useImageIndexChange(imageIndex, SCREEN);
  const [headerTransform, footerTransform, toggleBarsVisible] =
    useAnimatedComponents();

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex]);

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageList]
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={presentationStyle === "overFullScreen"}
      visible={visible}
      presentationStyle={presentationStyle}
      animationType={animationType}
      onRequestClose={onRequestCloseEnhanced}
      supportedOrientations={["portrait"]}
      hardwareAccelerated
    >
      <StatusBarManager presentationStyle={presentationStyle} />
      <View style={[styles.container, { opacity, backgroundColor }]}>
        <Animated.View style={[styles.header, { transform: headerTransform }]}>
          {typeof HeaderComponent !== "undefined" ? (
            React.createElement(HeaderComponent, {
              imageIndex: currentImageIndex,
            })
          ) : (
            <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
          )}
        </Animated.View>
        <VirtualizedList
          //@ts-ignore
          ref={imageList}
          data={views}
          horizontal
          pagingEnabled
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={imageIndex}
          getItem={(_, index) => views[index]}
          getItemCount={() => views.length}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }: { item: ViewSource }) => {
            if (item.type === "image") {
              return (
                <ImageItem
                  onZoom={onZoom}
                  imageItem={item}
                  onRequestClose={onRequestCloseEnhanced}
                  onLongPress={onLongPress}
                  delayLongPress={delayLongPress}
                  swipeToCloseEnabled={swipeToCloseEnabled}
                  doubleTapToZoomEnabled={doubleTapToZoomEnabled}
                />
              );
            }

            return (
              <ViewItem
                onRequestClose={onRequestCloseEnhanced}
                swipeToCloseEnabled={swipeToCloseEnabled}
              >
                {item.children as JSX.Element}
              </ViewItem>
            );
          }}
          onMomentumScrollEnd={onScroll}
        />
        {typeof FooterComponent !== "undefined" && (
          <Animated.View
            style={[styles.footer, { transform: footerTransform }]}
          >
            {React.createElement(FooterComponent, {
              imageIndex: currentImageIndex,
            })}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 0,
  },
  footer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0,
  },
});

const EnhancedImageViewing = (props: Props) => (
  <ImageViewing key={props.imageIndex} {...props} />
);

export default EnhancedImageViewing;
