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
	private ConnectivityManager.NetworkCallback networkCallback;

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

				// Sanitize MIME type (remove ;charset=... parameters which crash MediaStore)
				String cleanMime = "application/octet-stream";
				if (mimeType != null && !mimeType.trim().isEmpty()) {
					cleanMime = mimeType.split(";")[0].trim().toLowerCase();
				}
				if (fileName.toLowerCase().endsWith(".csv") || cleanMime.contains("csv")) {
					cleanMime = "text/csv";
				} else if (fileName.toLowerCase().endsWith(".json") || cleanMime.contains("json")) {
					cleanMime = "application/json";
				} else if (fileName.toLowerCase().endsWith(".pdf") || cleanMime.contains("pdf")) {
					cleanMime = "application/pdf";
				}

				String targetFileName = fileName;
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
					ContentValues values = new ContentValues();
					values.put(MediaStore.MediaColumns.DISPLAY_NAME, targetFileName);
					values.put(MediaStore.MediaColumns.MIME_TYPE, cleanMime);
					values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

					Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
					if (uri == null) {
						// In case of conflict or rejection, append timestamp
						targetFileName = System.currentTimeMillis() + "_" + fileName;
						values.put(MediaStore.MediaColumns.DISPLAY_NAME, targetFileName);
						uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
					}

					if (uri != null) {
						try (OutputStream out = getContentResolver().openOutputStream(uri)) {
							if (out != null) {
								out.write(fileBytes);
								out.flush();
							}
						}
					} else {
						// Fallback to external files downloads folder
						File downloadsDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
						if (downloadsDir != null) {
							if (!downloadsDir.exists()) downloadsDir.mkdirs();
							File fallbackFile = new File(downloadsDir, targetFileName);
							try (FileOutputStream fos = new FileOutputStream(fallbackFile)) {
								fos.write(fileBytes);
								fos.flush();
							}
						}
					}
				} else {
					File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
					if (!downloadsDir.exists()) downloadsDir.mkdirs();
					File file = new File(downloadsDir, targetFileName);
					try (FileOutputStream fos = new FileOutputStream(file)) {
						fos.write(fileBytes);
						fos.flush();
					}
				}

				final String savedName = targetFileName;
				runOnUiThread(() -> {
					Toast.makeText(MainActivity.this, "Saved to Downloads: " + savedName, Toast.LENGTH_LONG).show();
				});
				return true;
			} catch (Exception e) {
				e.printStackTrace();
				runOnUiThread(() -> {
					Toast.makeText(MainActivity.this, "Download error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
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

		// Register real-time network connectivity callback to push instant online/offline events into WebView
		try {
			ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
			if (cm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
				networkCallback = new ConnectivityManager.NetworkCallback() {
					@Override
					public void onAvailable(android.net.Network network) {
						runOnUiThread(() -> {
							try {
								WebView wv = bridge != null ? bridge.getWebView() : null;
								if (wv != null) {
									wv.evaluateJavascript("window.dispatchEvent(new CustomEvent('minesight:network-status', { detail: { isOnline: true } })); window.dispatchEvent(new Event('online'));", null);
								}
							} catch (Exception ignored) {}
						});
					}

					@Override
					public void onLost(android.net.Network network) {
						runOnUiThread(() -> {
							try {
								WebView wv = bridge != null ? bridge.getWebView() : null;
								if (wv != null) {
									wv.evaluateJavascript("window.dispatchEvent(new CustomEvent('minesight:network-status', { detail: { isOnline: false } })); window.dispatchEvent(new Event('offline'));", null);
								}
							} catch (Exception ignored) {}
						});
					}
				};
				cm.registerDefaultNetworkCallback(networkCallback);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		if (networkCallback != null) {
			try {
				ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
				if (cm != null) {
					cm.unregisterNetworkCallback(networkCallback);
				}
			} catch (Exception ignored) {}
			networkCallback = null;
		}
		if (tts != null) {
			try {
				tts.stop();
				tts.shutdown();
			} catch (Exception ignored) {}
			tts = null;
		}
	}
}
