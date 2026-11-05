package com.tahadi.thalathin;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity implements SensorEventListener {

    static final int REQ_STEPS = 11, REQ_NOTIF = 12, REQ_LOC = 13;

    WebView web;
    StepTracker steps;
    SensorManager sensorManager;
    Sensor stepSensor;
    private long lastJsNotify = 0;
    private final Handler main = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        steps = new StepTracker(this);
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        stepSensor = sensorManager != null ? sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) : null;

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#F6F7F9"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.addJavascriptInterface(new Bridge(this), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                return !"file".equals(u.getScheme());
            }
        });
        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");

        NotifyReceiver.createChannels(this);
        StepSnapshotReceiver.scheduleNightly(this);
    }

    /* ---------- الخطوات ---------- */
    boolean stepsAvailable() { return stepSensor != null; }

    boolean stepsPermitted() {
        return Build.VERSION.SDK_INT < 29
                || checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
    }

    void requestStepsPermission() {
        if (Build.VERSION.SDK_INT >= 29 && !stepsPermitted()) {
            requestPermissions(new String[]{Manifest.permission.ACTIVITY_RECOGNITION}, REQ_STEPS);
        } else {
            startStepListening();
            js("window.onNative && onNative('perm')");
        }
    }

    void startStepListening() {
        if (stepSensor != null && stepsPermitted()) {
            sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            steps.update((long) event.values[0]);
            long now = System.currentTimeMillis();
            if (now - lastJsNotify > 4000) {
                lastJsNotify = now;
                js("window.onNative && onNative('steps')");
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }

    /* ---------- الإشعارات ---------- */
    void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
        }
    }

    /* ---------- الموقع ---------- */
    void requestLocation() {
        if (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION}, REQ_LOC);
            return;
        }
        fetchLocation();
    }

    @SuppressWarnings("MissingPermission")
    private void fetchLocation() {
        final LocationManager lm = (LocationManager) getSystemService(LOCATION_SERVICE);
        if (lm == null) { sendLocation(null); return; }
        Location best = null;
        try {
            for (String p : lm.getProviders(true)) {
                Location l = lm.getLastKnownLocation(p);
                if (l != null && (best == null || l.getTime() > best.getTime())) best = l;
            }
        } catch (SecurityException ignored) { }
        if (best != null && System.currentTimeMillis() - best.getTime() < 6 * 3600_000L) {
            sendLocation(best);
            return;
        }
        String provider = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ? LocationManager.NETWORK_PROVIDER
                : lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ? LocationManager.GPS_PROVIDER : null;
        if (provider == null) { sendLocation(best); return; }
        final Location fallback = best;
        final boolean[] done = {false};
        final LocationListener listener = new LocationListener() {
            @Override public void onLocationChanged(Location location) {
                if (done[0]) return;
                done[0] = true;
                lm.removeUpdates(this);
                sendLocation(location);
            }
            @Override public void onStatusChanged(String p, int s, Bundle b) { }
            @Override public void onProviderEnabled(String p) { }
            @Override public void onProviderDisabled(String p) { }
        };
        try {
            lm.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper());
        } catch (SecurityException e) { sendLocation(fallback); return; }
        main.postDelayed(() -> {
            if (!done[0]) {
                done[0] = true;
                lm.removeUpdates(listener);
                sendLocation(fallback);
            }
        }, 20000);
    }

    private void sendLocation(Location l) {
        if (l == null) js("window.onNative && onNative('location', null)");
        else js("window.onNative && onNative('location', {lat:" + l.getLatitude() + ",lng:" + l.getLongitude() + "})");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        if (requestCode == REQ_STEPS && granted) startStepListening();
        if (requestCode == REQ_LOC) {
            if (granted) fetchLocation(); else sendLocation(null);
        }
        js("window.onNative && onNative('perm')");
    }

    /* ---------- الألوان ---------- */
    void setBars(String color, boolean light) {
        try {
            Window w = getWindow();
            int c = Color.parseColor(color);
            w.setStatusBarColor(c);
            w.setNavigationBarColor(c);
            web.setBackgroundColor(c);
            int flags = w.getDecorView().getSystemUiVisibility();
            int bits = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            flags = light ? (flags | bits) : (flags & ~bits);
            w.getDecorView().setSystemUiVisibility(flags);
        } catch (Exception ignored) { }
    }

    void js(final String code) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    @Override
    protected void onResume() {
        super.onResume();
        startStepListening();
        js("window.onNative && onNative('resume')");
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sensorManager != null) sensorManager.unregisterListener(this);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        web.evaluateJavascript("window.onBack ? window.onBack() : false", value -> {
            if (!"true".equals(value)) finish();
        });
    }
}
