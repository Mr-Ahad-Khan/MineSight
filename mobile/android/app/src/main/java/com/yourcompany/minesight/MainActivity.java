package com.yourcompany.minesight;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

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
	}
}
