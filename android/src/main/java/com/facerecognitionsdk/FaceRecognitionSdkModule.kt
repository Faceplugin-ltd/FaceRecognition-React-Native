package com.facerecognitionsdk

import android.graphics.Bitmap
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.faceplugin.facerecognitionsdk.FaceBox
import com.faceplugin.facerecognitionsdk.FaceDetectionParam
import com.faceplugin.facerecognitionsdk.FaceRecognitionSDK
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors

class FaceRecognitionSdkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val executor = Executors.newSingleThreadExecutor()
  @Volatile private var lastLiveBitmap: Bitmap? = null

  override fun getName(): String = NAME

  override fun getConstants(): MutableMap<String, Any> = hashMapOf(
    "SDK_SUCCESS" to FaceRecognitionSDK.SDK_SUCCESS,
    "SDK_LICENSE_INVALID" to FaceRecognitionSDK.SDK_LICENSE_INVALID,
    "SDK_LICENSE_EXPIRED" to FaceRecognitionSDK.SDK_LICENSE_EXPIRED,
    "SDK_NOT_ACTIVATED" to FaceRecognitionSDK.SDK_NOT_ACTIVATED,
    "SDK_INIT_FAILED" to FaceRecognitionSDK.SDK_INIT_FAILED,
    "DETECT_POSE" to FaceRecognitionSDK.DETECT_POSE,
    "DETECT_LANDMARKS" to FaceRecognitionSDK.DETECT_LANDMARKS,
    "DETECT_AGE" to FaceRecognitionSDK.DETECT_AGE,
    "DETECT_GENDER" to FaceRecognitionSDK.DETECT_GENDER,
    "DETECT_EMOTION" to FaceRecognitionSDK.DETECT_EMOTION,
    "DETECT_MASK" to FaceRecognitionSDK.DETECT_MASK,
    "DETECT_QUALITY" to FaceRecognitionSDK.DETECT_QUALITY,
    "DETECT_FACE_QUALITY" to FaceRecognitionSDK.DETECT_FACE_QUALITY,
    "DETECT_EYES" to FaceRecognitionSDK.DETECT_EYES,
    "DETECT_LIVENESS" to FaceRecognitionSDK.DETECT_LIVENESS,
    "DETECT_GLASSES" to FaceRecognitionSDK.DETECT_GLASSES,
    "DETECT_LIVENESS_ACCURATE" to FaceRecognitionSDK.DETECT_LIVENESS_ACCURATE,
    "DETECT_ALL" to FaceRecognitionSDK.DETECT_ALL,
    "LANDMARK_MODE_14" to FaceRecognitionSDK.LANDMARK_MODE_14,
    "LANDMARK_MODE_68" to FaceRecognitionSDK.LANDMARK_MODE_68,
    "LANDMARK_MODE_468" to FaceRecognitionSDK.LANDMARK_MODE_468,
  )

  @ReactMethod
  fun addListener(eventName: String?) {
    // Required for RN built-in EventEmitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for RN built-in EventEmitter
  }

  @ReactMethod
  fun getMachineCode(promise: Promise) {
    executor.execute {
      try {
        promise.resolve(FaceRecognitionSDK.getMachineCode(reactContext.applicationContext) ?: "")
      } catch (t: Throwable) {
        promise.reject("E_MACHINE_CODE", t.message, t)
      }
    }
  }

  @ReactMethod
  fun getLicenseStatus(promise: Promise) {
    executor.execute {
      try {
        promise.resolve(FaceRecognitionSDK.getLicenseStatus())
      } catch (t: Throwable) {
        promise.reject("E_LICENSE_STATUS", t.message, t)
      }
    }
  }

  @ReactMethod
  fun setActivation(license: String, promise: Promise) {
    executor.execute {
      try {
        val code = FaceRecognitionSDK.setActivation(reactContext.applicationContext, license)
        promise.resolve(code)
      } catch (t: Throwable) {
        promise.reject("E_ACTIVATION", t.message, t)
      }
    }
  }

  @ReactMethod
  fun init(promise: Promise) {
    executor.execute {
      try {
        val code = FaceRecognitionSDK.init(reactContext.applicationContext)
        promise.resolve(code)
      } catch (t: Throwable) {
        promise.reject("E_INIT", t.message, t)
      }
    }
  }

  @ReactMethod
  fun deinit(promise: Promise) {
    executor.execute {
      try {
        FaceRecognitionSDK.deinit()
        promise.resolve(null)
      } catch (t: Throwable) {
        promise.reject("E_DEINIT", t.message, t)
      }
    }
  }

  @ReactMethod
  fun lastLicenseError(promise: Promise) {
    try {
      promise.resolve(FaceRecognitionSDK.lastLicenseError() ?: "")
    } catch (t: Throwable) {
      promise.reject("E_LICENSE_ERROR", t.message, t)
    }
  }

  @ReactMethod
  fun setLandmarkMode(mode: Int, promise: Promise) {
    executor.execute {
      try {
        promise.resolve(FaceRecognitionSDK.setLandmarkMode(mode))
      } catch (t: Throwable) {
        promise.reject("E_LANDMARK", t.message, t)
      }
    }
  }

  @ReactMethod
  fun getLandmarkMode(promise: Promise) {
    executor.execute {
      try {
        promise.resolve(FaceRecognitionSDK.getLandmarkMode())
      } catch (t: Throwable) {
        promise.reject("E_LANDMARK", t.message, t)
      }
    }
  }

  @ReactMethod
  fun detect(imageUri: String, crop: Boolean, flags: Double, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val flagInt = flags.toInt()
        val json = if (flagInt == FaceRecognitionSDK.DETECT_ALL || flagInt < 0) {
          FaceRecognitionSDK.detect(bitmap, crop, FaceRecognitionSDK.DETECT_ALL)
        } else {
          FaceRecognitionSDK.detect(bitmap, crop, flagInt)
        }
        promise.resolve(json ?: "{}")
      } catch (t: Throwable) {
        promise.reject("E_DETECT", t.message, t)
      }
    }
  }

  @ReactMethod
  fun faceDetection(imageUri: String, paramJson: String?, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val param = parseParam(paramJson)
        val boxes = FaceRecognitionSDK.faceDetection(bitmap, param)
        promise.resolve(boxesToJson(boxes))
      } catch (t: Throwable) {
        promise.reject("E_FACE_DETECTION", t.message, t)
      }
    }
  }

  @ReactMethod
  fun templateExtraction(imageUri: String, faceBoxJson: String, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val face = jsonToFaceBox(faceBoxJson)
          ?: run {
            promise.reject("E_FACE", "Invalid face box JSON")
            return@execute
          }
        val bytes = FaceRecognitionSDK.templateExtraction(bitmap, face)
        if (bytes == null) {
          promise.reject("E_TEMPLATE", "templateExtraction returned null")
          return@execute
        }
        promise.resolve(Base64.encodeToString(bytes, Base64.NO_WRAP))
      } catch (t: Throwable) {
        promise.reject("E_TEMPLATE", t.message, t)
      }
    }
  }

  @ReactMethod
  fun cropFace(imageUri: String, faceBoxJson: String, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val face = jsonToFaceBox(faceBoxJson)
          ?: run {
            promise.reject("E_FACE", "Invalid face box JSON")
            return@execute
          }
        val cropped = FaceRecognitionSDK.cropFace(bitmap, face)
          ?: run {
            promise.reject("E_CROP", "cropFace returned null")
            return@execute
          }
        promise.resolve(bitmapToBase64Jpeg(cropped))
      } catch (t: Throwable) {
        promise.reject("E_CROP", t.message, t)
      }
    }
  }

  @ReactMethod
  fun extractFeature(imageUri: String, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        promise.resolve(FaceRecognitionSDK.extractFeature(bitmap) ?: "{}")
      } catch (t: Throwable) {
        promise.reject("E_FEATURE", t.message, t)
      }
    }
  }

  @ReactMethod
  fun similarity(feature1B64: String, feature2B64: String, promise: Promise) {
    executor.execute {
      try {
        val f1 = Base64.decode(feature1B64, Base64.DEFAULT)
        val f2 = Base64.decode(feature2B64, Base64.DEFAULT)
        promise.resolve(FaceRecognitionSDK.similarity(f1, f2).toDouble())
      } catch (t: Throwable) {
        promise.reject("E_SIMILARITY", t.message, t)
      }
    }
  }

  @ReactMethod
  fun quality(imageUri: String, crop: Boolean, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        promise.resolve(FaceRecognitionSDK.quality(bitmap, crop) ?: "{}")
      } catch (t: Throwable) {
        promise.reject("E_QUALITY", t.message, t)
      }
    }
  }

  @ReactMethod
  fun startVideoWorker(configJson: String?, promise: Promise) {
    executor.execute {
      try {
        FaceRecognitionSDK.setVideoWorkerEventHandler { json ->
          emitVideoWorkerEvent(json)
        }
        val threshold = parseMatchThreshold(configJson)
        val code = FaceRecognitionSDK.startVideoWorker(threshold)
        promise.resolve(code)
      } catch (t: Throwable) {
        promise.reject("E_VIDEO_WORKER", t.message, t)
      }
    }
  }

  @ReactMethod
  fun stopVideoWorker(promise: Promise) {
    executor.execute {
      try {
        FaceRecognitionSDK.stopVideoWorker()
        FaceRecognitionSDK.setVideoWorkerEventHandler(null)
        promise.resolve(null)
      } catch (t: Throwable) {
        promise.reject("E_VIDEO_WORKER", t.message, t)
      }
    }
  }

  @ReactMethod
  fun syncVideoWorkerDatabase(featuresB64: ReadableArray, matchThreshold: Double, promise: Promise) {
    executor.execute {
      try {
        val list = ArrayList<ByteArray>(featuresB64.size())
        for (i in 0 until featuresB64.size()) {
          val s = featuresB64.getString(i) ?: continue
          list.add(Base64.decode(s, Base64.DEFAULT))
        }
        val code = FaceRecognitionSDK.syncVideoWorkerDatabase(list, matchThreshold.toFloat())
        promise.resolve(code)
      } catch (t: Throwable) {
        promise.reject("E_SYNC_DB", t.message, t)
      }
    }
  }

  @ReactMethod
  fun probeLiveImage(imageUri: String, promise: Promise) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val map = Arguments.createMap()
        map.putDouble("width", bitmap.width.toDouble())
        map.putDouble("height", bitmap.height.toDouble())
        promise.resolve(map)
      } catch (t: Throwable) {
        promise.reject("E_IMAGE", t.message, t)
      }
    }
  }

  @ReactMethod
  fun applyLiveFrame(
    imageUri: String,
    rotateDegrees: Double,
    maxEdge: Double,
    feedWorker: Boolean,
    promise: Promise
  ) {
    executor.execute {
      try {
        val bitmap = loadBitmap(imageUri)
          ?: run {
            promise.reject("E_IMAGE", "Could not decode image: $imageUri")
            return@execute
          }
        val prepared = applyLiveTransform(
          bitmap,
          rotateDegrees.toFloat(),
          maxEdge.toInt().coerceAtLeast(1)
        )
        lastLiveBitmap = prepared
        if (feedWorker) {
          FaceRecognitionSDK.addVideoWorkerFrame(prepared)
          promise.resolve(liveFrameMap(prepared, ingested = true, uri = null))
        } else {
          promise.resolve(
            liveFrameMap(prepared, ingested = true, uri = writeLiveJpeg(prepared))
          )
        }
      } catch (t: Throwable) {
        promise.reject("E_FRAME", t.message, t)
      }
    }
  }

  @ReactMethod
  fun exportLastLiveFrame(promise: Promise) {
    executor.execute {
      try {
        val prepared = lastLiveBitmap
          ?: run {
            promise.reject("E_IMAGE", "No live frame")
            return@execute
          }
        promise.resolve(liveFrameMap(prepared, ingested = true, uri = writeLiveJpeg(prepared)))
      } catch (t: Throwable) {
        promise.reject("E_FRAME", t.message, t)
      }
    }
  }

  @ReactMethod
  fun writeStatus(json: String, promise: Promise) {
    try {
      val file = java.io.File(reactContext.filesDir, "facerecognition_status.json")
      file.writeText(json)
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("E_STATUS", t.message, t)
    }
  }

  private fun emitVideoWorkerEvent(json: String) {
    if (!reactContext.hasActiveReactInstance()) return
    val map: WritableMap = Arguments.createMap()
    map.putString("json", json)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_VIDEO_WORKER, map)
  }

  private fun loadBitmap(uriOrBase64: String): Bitmap? {
    return if (uriOrBase64.startsWith("data:") || looksLikeBase64(uriOrBase64)) {
      ImageUtils.bitmapFromBase64(uriOrBase64)
    } else {
      ImageUtils.bitmapFromUri(reactContext, uriOrBase64)
    }
  }

  private fun looksLikeBase64(s: String): Boolean {
    if (s.startsWith("content:") || s.startsWith("file:") || s.startsWith("/")) return false
    return s.length > 256 && !s.contains("://")
  }

  private fun parseParam(paramJson: String?): FaceDetectionParam {
    if (paramJson.isNullOrBlank()) return FaceDetectionParam()
    return try {
      val o = JSONObject(paramJson)
      if (o.optBoolean("allAttributes", false)) {
        return FaceDetectionParam.allAttributes().also {
          if (o.has("check_liveness_level")) {
            it.check_liveness_level = o.optInt("check_liveness_level", 0)
          }
        }
      }
      FaceDetectionParam().apply {
        check_liveness = o.optBoolean("check_liveness", check_liveness)
        check_liveness_level = o.optInt("check_liveness_level", check_liveness_level)
        check_eye_closeness = o.optBoolean("check_eye_closeness", check_eye_closeness)
        check_face_occlusion = o.optBoolean("check_face_occlusion", check_face_occlusion)
        estimate_age_gender = o.optBoolean("estimate_age_gender", estimate_age_gender)
        check_pose = o.optBoolean("check_pose", check_pose)
        check_landmarks = o.optBoolean("check_landmarks", check_landmarks)
        check_quality = o.optBoolean("check_quality", check_quality)
        check_emotion = o.optBoolean("check_emotion", check_emotion)
        check_mask = o.optBoolean("check_mask", check_mask)
        check_glasses = o.optBoolean("check_glasses", check_glasses)
      }
    } catch (_: Exception) {
      FaceDetectionParam()
    }
  }

  private fun boxesToJson(boxes: List<FaceBox>): String {
    val arr = JSONArray()
    for (b in boxes) {
      arr.put(faceBoxToJson(b))
    }
    return arr.toString()
  }

  private fun faceBoxToJson(b: FaceBox): JSONObject {
    val o = JSONObject()
    o.put("x1", b.x1)
    o.put("y1", b.y1)
    o.put("x2", b.x2)
    o.put("y2", b.y2)
    o.put("yaw", b.yaw.toDouble())
    o.put("roll", b.roll.toDouble())
    o.put("pitch", b.pitch.toDouble())
    o.put("liveness", b.liveness.toDouble())
    o.put("face_quality", b.face_quality.toDouble())
    o.put("face_luminance", b.face_luminance.toDouble())
    o.put("left_eye_closed", b.left_eye_closed.toDouble())
    o.put("right_eye_closed", b.right_eye_closed.toDouble())
    o.put("face_occlusion", b.face_occlusion.toDouble())
    o.put("mouth_opened", b.mouth_opened.toDouble())
    o.put("age", b.age)
    o.put("gender", b.gender)
    o.put("livenessLabel", b.livenessLabel ?: "")
    o.put("genderLabel", b.genderLabel ?: "")
    o.put("emotionLabel", b.emotionLabel ?: "")
    o.put("maskLabel", b.maskLabel ?: "")
    o.put("qualityLabel", b.qualityLabel ?: "")
    o.put("eyesLeftLabel", b.eyesLeftLabel ?: "")
    o.put("eyesRightLabel", b.eyesRightLabel ?: "")
    // Prefer engine map (Glasses / Lighting / Sharpness / …) — same as iOS attributes.
    val attrs = JSONObject()
    for ((key, value) in b.extraAttributes) {
      if (key.isNotBlank() && !value.isNullOrBlank()) {
        attrs.put(key, value)
      }
    }
    o.put("attributes", attrs)
    o.put(
      "glassesLabel",
      b.extraAttributes["Glasses"]
        ?: b.extraAttributes["glasses"]
        ?: ""
    )
    o.put(
      "sunglassesLabel",
      b.extraAttributes["Sunglasses"]
        ?: b.extraAttributes["sunglasses"]
        ?: ""
    )
    o.put(
      "occlusionLabel",
      b.extraAttributes["Occlusion"]
        ?: b.extraAttributes["FaceOcclusion"]
        ?: b.extraAttributes["occlusion"]
        ?: ""
    )
    o.put("landmarkCount", b.landmarkCount)
    val lm = JSONArray()
    val n = (b.landmarkCount * 2).coerceAtMost(b.landmarks_68.size)
    for (i in 0 until n) {
      lm.put(b.landmarks_68[i].toDouble())
    }
    o.put("landmarks", lm)
    return o
  }

  private fun jsonToFaceBox(json: String): FaceBox? {
    return try {
      val o = JSONObject(json)
      FaceBox().apply {
        x1 = o.optInt("x1")
        y1 = o.optInt("y1")
        x2 = o.optInt("x2")
        y2 = o.optInt("y2")
        yaw = o.optDouble("yaw").toFloat()
        roll = o.optDouble("roll").toFloat()
        pitch = o.optDouble("pitch").toFloat()
        liveness = o.optDouble("liveness").toFloat()
        face_quality = o.optDouble("face_quality").toFloat()
        left_eye_closed = o.optDouble("left_eye_closed").toFloat()
        right_eye_closed = o.optDouble("right_eye_closed").toFloat()
        face_occlusion = o.optDouble("face_occlusion").toFloat()
        age = o.optInt("age")
        gender = o.optInt("gender")
        landmarkCount = o.optInt("landmarkCount")
        val lm = o.optJSONArray("landmarks")
        if (lm != null) {
          val n = lm.length().coerceAtMost(landmarks_68.size)
          for (i in 0 until n) {
            landmarks_68[i] = lm.optDouble(i).toFloat()
          }
        }
      }
    } catch (_: Exception) {
      null
    }
  }

  private fun parseMatchThreshold(configJson: String?): Float {
    if (configJson.isNullOrBlank()) return 0.67f
    return try {
      JSONObject(configJson).optDouble("matchThreshold", 0.67).toFloat()
    } catch (_: Exception) {
      0.67f
    }
  }

  private fun bitmapToBase64Jpeg(bitmap: Bitmap): String {
    val out = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
    return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
  }

  private fun liveFrameMap(prepared: Bitmap, ingested: Boolean, uri: String?): WritableMap {
    val map = Arguments.createMap()
    map.putBoolean("ingested", ingested)
    map.putDouble("width", prepared.width.toDouble())
    map.putDouble("height", prepared.height.toDouble())
    if (uri != null) map.putString("uri", uri) else map.putNull("uri")
    return map
  }

  private fun writeLiveJpeg(prepared: Bitmap): String {
    val file = java.io.File(reactContext.cacheDir, "frs_live_${System.currentTimeMillis()}.jpg")
    file.outputStream().use { out ->
      prepared.compress(Bitmap.CompressFormat.JPEG, 85, out)
    }
    return "file://${file.absolutePath}"
  }

  /** Rotate by degrees (JS policy) then scale long edge ≤ maxEdge. No front/back branching. */
  private fun applyLiveTransform(src: Bitmap, rotateDegrees: Float, maxEdge: Int): Bitmap {
    var frame = src
    val deg = rotateDegrees % 360f
    if (kotlin.math.abs(deg) > 0.01f) {
      val matrix = android.graphics.Matrix().apply { postRotate(deg) }
      val rotated = Bitmap.createBitmap(frame, 0, 0, frame.width, frame.height, matrix, true)
      if (rotated !== frame && frame !== src) frame.recycle()
      frame = rotated
    }
    return scaleMax(frame, maxEdge)
  }

  private fun scaleMax(src: Bitmap, maxEdge: Int): Bitmap {
    val w = src.width
    val h = src.height
    val edge = maxOf(w, h)
    if (edge <= maxEdge) return src
    val scale = maxEdge.toFloat() / edge
    return Bitmap.createScaledBitmap(src, (w * scale).toInt(), (h * scale).toInt(), true)
  }

  companion object {
    const val NAME = "FaceRecognitionSdk"
    const val EVENT_VIDEO_WORKER = "FaceRecognitionVideoWorkerEvent"
  }
}
