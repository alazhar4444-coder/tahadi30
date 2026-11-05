package com.tahadi.thalathin;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;

/* الجسر بين واجهة HTML وأندرويد */
public class Bridge {
    private final MainActivity act;
    private final SharedPreferences data;

    Bridge(MainActivity act) {
        this.act = act;
        this.data = act.getSharedPreferences("data", Context.MODE_PRIVATE);
    }

    @JavascriptInterface
    public String load(String key) { return data.getString(key, null); }

    @JavascriptInterface
    public void save(String key, String value) { data.edit().putString(key, value).apply(); }

    @JavascriptInterface
    public String getStepsJson() {
        return act.steps.toJson(act.stepsAvailable(), act.stepsPermitted());
    }

    @JavascriptInterface
    public void requestSteps() { act.runOnUiThread(act::requestStepsPermission); }

    @JavascriptInterface
    public void requestNotifications() { act.runOnUiThread(act::requestNotificationPermission); }

    @JavascriptInterface
    public void requestLocation() { act.runOnUiThread(act::requestLocation); }

    @JavascriptInterface
    public void schedule(String json) { AlarmScheduler.schedule(act.getApplicationContext(), json); }

    @JavascriptInterface
    public void setBars(final String color, final boolean light) { act.runOnUiThread(() -> act.setBars(color, light)); }

    @JavascriptInterface
    public void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) act.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) v.vibrate(VibrationEffect.createOneShot(Math.max(5, ms), VibrationEffect.DEFAULT_AMPLITUDE));
        } catch (Exception ignored) { }
    }

    @JavascriptInterface
    public void share(final String text) {
        act.runOnUiThread(() -> {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_SUBJECT, "نسخة احتياطية — تحدي ٣٠ يوم");
            i.putExtra(Intent.EXTRA_TEXT, text);
            act.startActivity(Intent.createChooser(i, "حفظ النسخة الاحتياطية"));
        });
    }
}
