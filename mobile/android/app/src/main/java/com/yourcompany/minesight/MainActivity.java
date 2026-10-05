package com.yourcompany.minesight;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import android.speech.tts.TextToSpeech;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Environment;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Base64;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	private TextToSpeech tts;
	private boolean ttsReady = false;

	public class AndroidBridge {
		@JavascriptInterface
		public boolean isNetworkConnected() {
			try {
				ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
				if (cm == null) return false;
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
					android.net.Network activeNetwork = cm.getActiveNetwork();
					if (activeNetwork == null) return false;
					NetworkCapabilities caps = cm.getNetworkCapabilities(activeNetwork);
					return caps != null && (caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) || caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED));
				} else {
					NetworkInfo ni = cm.getActiveNetworkInfo();
					return ni != null && ni.isConnectedOrConnecting();
				}
			} catch (Exception e) {
				return false;
			}
		}

		@JavascriptInterface
		public void speakText(String text, String lang) {
			if (text == null || text.trim().isEmpty()) return;
			runOnUiThread(() -> {
				try {
					if (tts == null) {
						tts = new TextToSpeech(MainActivity.this, status -> {
							if (status == TextToSpeech.SUCCESS) {
								ttsReady = true;
								performSpeak(text, lang);
							}
						});
					} else if (ttsReady) {
						performSpeak(text, lang);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			});
		}

		private void performSpeak(String text, String lang) {
			try {
				if (tts == null) return;
				if ("hi".equalsIgnoreCase(lang) || "hi-IN".equalsIgnoreCase(lang)) {
					tts.setLanguage(new Locale("hi", "IN"));
				} else {
					tts.setLanguage(Locale.US);
				}
				tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "minesight_tts_" + System.currentTimeMillis());
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		@JavascriptInterface
		public void stopSpeaking() {
			runOnUiThread(() -> {
				if (tts != null) {
					try {
						tts.stop();
					} catch (Exception ignored) {}
				}
			});
		}

		@JavascriptInterface
		public boolean saveBase64File(String base64Data, String fileName, String mimeType) {
			if (base64Data == null || fileName == null) return false;
			try {
				String cleanBase64 = base64Data;
				int commaIdx = cleanBase64.indexOf(",");
				if (commaIdx >= 0) {
					cleanBase64 = cleanBase64.substring(commaIdx + 1);
				}
				byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
					ContentValues values = new ContentValues();
					values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
					values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType != null ? mimeType : "application/octet-stream");
					values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

					Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
					if (uri != null) {
						try (OutputStream out = getContentResolver().openOutputStream(uri)) {
							if (out != null) {
								out.write(fileBytes);
								out.flush();
							}
						}
					}
				} else {
					File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
					if (!downloadsDir.exists()) downloadsDir.mkdirs();
					File file = new File(downloadsDir, fileName);
					try (FileOutputStream fos = new FileOutputStream(file)) {
						fos.write(fileBytes);
						fos.flush();
					}
				}

				runOnUiThread(() -> {
					Toast.makeText(MainActivity.this, "Downloaded: " + fileName, Toast.LENGTH_LONG).show();
				});
				return true;
			} catch (Exception e) {
				e.printStackTrace();
				runOnUiThread(() -> {
					Toast.makeText(MainActivity.this, "Download failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
				});
				return false;
			}
		}
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Initialize native text to speech
		tts = new TextToSpeech(this, status -> {
			if (status == TextToSpeech.SUCCESS) {
				ttsReady = true;
			}
		});

		Window window = getWindow();
		window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
		window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
		window.setStatusBarColor(Color.TRANSPARENT);
		window.setNavigationBarColor(Color.rgb(15, 23, 32));
		WindowCompat.setDecorFitsSystemWindows(window, false);

		WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
		if (controller != null) {
			controller.setAppearanceLightStatusBars(false);
			controller.setAppearanceLightNavigationBars(false);
		}
		window.getDecorView().setSystemUiVisibility(0);

		View content = findViewById(android.R.id.content);
		int initialTopPadding = content.getPaddingTop();
		int initialBottomPadding = content.getPaddingBottom();
		ViewCompat.setOnApplyWindowInsetsListener(content, (view, insets) -> {
			Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
			view.setPadding(
				view.getPaddingLeft(),
				initialTopPadding + systemBars.top,
				view.getPaddingRight(),
				initialBottomPadding + systemBars.bottom
			);
			return insets;
		});
		ViewCompat.requestApplyInsets(content);

		// Attach AndroidBridge and configure WebView
		try {
			WebView webView = this.bridge.getWebView();
			if (webView != null) {
				WebSettings settings = webView.getSettings();
				settings.setGeolocationEnabled(true);
				settings.setMediaPlaybackRequiresUserGesture(false);
				settings.setDatabaseEnabled(true);
				settings.setDomStorageEnabled(true);
				webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		if (tts != null) {
			try {
				tts.stop();
				tts.shutdown();
			} catch (Exception ignored) {}
			tts = null;
		}
	}
}
