import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ImageFilters, { Constants } from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-expo';
import { Presets } from 'react-native-gl-image-filters';
import * as MediaLibrary from 'expo-media-library';
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import { Camera, CameraType } from 'expo-camera';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';


export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const [filterSetting, setFilterSetting] = [{
    hue: 0,
    blur: 0,
    
  }]

  useEffect(() => {
    console.log(selectedImage)
  }, [selectedImage])

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  let openImagePickerAsync = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    let updatedH, updatedW;
    const MAXGL = 2048
    let isOverSized = false;
    // size checking, cannot > MAXGL
    if (pickerResult.height > pickerResult.width) {
      //h 
      if (pickerResult.height > MAXGL) {
        updatedH = MAXGL
        updatedW = MAXGL / (pickerResult.height / pickerResult.width)
        isOverSized = true
      }
    } else if (pickerResult.width < pickerResult.height) {
      //v
      if (pickerResult.width > MAXGL) {
        updatedW = MAXGL
        updatedH = MAXGL / (pickerResult.width / pickerResult.height)
        isOverSized = true
      }
    } else {
      //squra
      if (pickerResult.width > MAXGL) {
        updatedH = MAXGL
        updatedW = MAXGL
        isOverSized = true
      }
    }

    if (isOverSized) {
      const rotateImg = await manipulateAsync(
        pickerResult.uri,
        [{ rotate: 360 }, { resize: { height: updatedH, width: updatedW } }],
        { compress: 1, format: SaveFormat.JPEG }
      )
      setSelectedImage({
        imgUri: rotateImg.uri,
        imgHeight: rotateImg.height,
        imgWidth: rotateImg.width
      })
    } else {
      setSelectedImage({
        imgUri: pickerResult.uri,
        imgHeight: pickerResult.height,
        imgWidth: pickerResult.width,
      })
    }
  }

  const saveImage = async () => {
    if (!this.image) return;

    const result = await this.image.glView.capture({ quality: 1 });

    MediaLibrary.saveToLibraryAsync(result.localUri).then(saved => {
      console.log(saved)
    })
  }

  const INITZOOM = (value) => {
    switch(value){
      case value > 0 && value < 1000 : 
        return 0.4
      case value > 1001 && value < 2000 :
        return 0.3
      case value > 2000 :
        return 0.2
      default: 
       return 0.2
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ borderWidth: 1, flex: 1 }}>     
      {
          selectedImage !== null &&
          <ReactNativeZoomableView
            maxZoom={1.5}
            minZoom={0.1}
            zoomStep={0.5}
            initialZoom={INITZOOM(selectedImage.imgHeight)}
           
          >
            <Surface
              style={{
                height: selectedImage.imgHeight,
                width: selectedImage.imgWidth
              }}
            //  ref={ref => (this.image = ref)}
            >
              <ImageFilters
                height={selectedImage.imgHeight}
                width={selectedImage.imgWidth}
                blur={blur}>
                {{ uri: selectedImage.imgUri }}
              </ImageFilters>
            </Surface>

          </ReactNativeZoomableView>
          }

      </View>

      <View style={{ flex: 1, backgroundColor: '#0022ff' }}>
        <TouchableOpacity onPress={openImagePickerAsync} style={{ alignItems: 'center' }} >
          <Text style={styles.buttonText}>Pick a photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveImage} style={{ alignItems: 'center' }}>
          <Text>save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setBlur(blur + 1) }} style={{ alignItems: 'center' }}>
          <Text>blur</Text>
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
