package com.yourcompany.minesight;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		Window window = getWindow();
		window.setStatusBarColor(Color.rgb(15, 23, 32));
		window.setNavigationBarColor(Color.rgb(15, 23, 32));

		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
			window.setDecorFitsSystemWindows(true);
			WindowInsetsController controller = window.getInsetsController();
			if (controller != null) {
				controller.setSystemBarsAppearance(
					0,
					WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
						| WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
				);
			}
		} else {
			window.getDecorView().setSystemUiVisibility(0);
		}

		View webView = getBridge().getWebView();
		ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
			Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
			view.setPadding(
				view.getPaddingLeft(),
				systemBars.top,
				view.getPaddingRight(),
				systemBars.bottom
			);
			return insets;
		});
		ViewCompat.requestApplyInsets(webView);
	}
}
