package facerecognitionsdk.example

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    preloadFaceRecognitionNativeLibs()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }

  /** Load FaceRecognition engine deps before RN/Hermes to avoid linker namespace issues on Android 8. */
  private fun preloadFaceRecognitionNativeLibs() {
    val libDir = applicationInfo.nativeLibraryDir
    val libs =
        arrayOf(
            "c++_shared",
            "onnxruntime",
            "FaceRecognitionEngine",
            "FaceRecognitionEngine_jni",
            "FaceRecognitionSDK",
        )
    for (name in libs) {
      try {
        System.loadLibrary(name)
        Log.i(TAG, "preload ok: $name")
      } catch (e: UnsatisfiedLinkError) {
        Log.w(TAG, "preload loadLibrary failed: $name", e)
        try {
          System.load("$libDir/lib$name.so")
          Log.i(TAG, "preload ok path: lib$name.so")
        } catch (e2: UnsatisfiedLinkError) {
          Log.e(TAG, "preload failed: lib$name.so", e2)
        }
      }
    }
  }

  companion object {
    private const val TAG = "FaceRecPreload"
  }
}
