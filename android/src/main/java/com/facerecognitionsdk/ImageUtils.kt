package com.facerecognitionsdk

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.util.Base64
import androidx.exifinterface.media.ExifInterface
import java.io.ByteArrayInputStream
import java.io.InputStream

internal object ImageUtils {
  fun bitmapFromUri(context: Context, uriString: String): Bitmap? {
    val uri = Uri.parse(uriString)
    val stream: InputStream = context.contentResolver.openInputStream(uri) ?: return null
    stream.use { input ->
      val bytes = input.readBytes()
      val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size) ?: return null
      return applyExifOrientation(bytes, bitmap)
    }
  }

  fun bitmapFromBase64(base64: String): Bitmap? {
    val cleaned = base64.substringAfter("base64,", base64)
    val bytes = Base64.decode(cleaned, Base64.DEFAULT)
    return BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
  }

  private fun applyExifOrientation(jpegBytes: ByteArray, bitmap: Bitmap): Bitmap {
    return try {
      val exif = ExifInterface(ByteArrayInputStream(jpegBytes))
      val orientation = exif.getAttributeInt(
        ExifInterface.TAG_ORIENTATION,
        ExifInterface.ORIENTATION_NORMAL
      )
      val degrees = when (orientation) {
        ExifInterface.ORIENTATION_ROTATE_90 -> 90f
        ExifInterface.ORIENTATION_ROTATE_180 -> 180f
        ExifInterface.ORIENTATION_ROTATE_270 -> 270f
        else -> 0f
      }
      if (degrees == 0f) {
        bitmap
      } else {
        val matrix = Matrix().apply { postRotate(degrees) }
        Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
      }
    } catch (_: Exception) {
      bitmap
    }
  }
}
