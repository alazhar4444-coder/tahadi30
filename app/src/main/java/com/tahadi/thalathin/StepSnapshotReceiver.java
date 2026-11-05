package com.tahadi.thalathin;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;

import java.util.Calendar;

/* قراءة عدّاد الخطوات قبل منتصف الليل حتى تُنسب خطوات كل يوم ليومها */
public class StepSnapshotReceiver extends BroadcastReceiver {

    static void scheduleNightly(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 57);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_MONTH, 1);
        Intent i = new Intent(c, StepSnapshotReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(c, 9001, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        AlarmScheduler.setAlarm(am, cal.getTimeInMillis(), pi);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        final Context c = context.getApplicationContext();
        scheduleNightly(c);
        if (Build.VERSION.SDK_INT >= 29
                && c.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        final SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        final Sensor s = sm != null ? sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) : null;
        if (s == null) return;

        final PendingResult result = goAsync();
        final Handler h = new Handler(Looper.getMainLooper());
        final boolean[] done = {false};
        final SensorEventListener l = new SensorEventListener() {
            @Override public void onSensorChanged(SensorEvent e) {
                if (done[0]) return;
                done[0] = true;
                new StepTracker(c).update((long) e.values[0]);
                sm.unregisterListener(this);
                result.finish();
            }
            @Override public void onAccuracyChanged(Sensor sensor, int accuracy) { }
        };
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL, h);
        h.postDelayed(() -> {
            if (!done[0]) {
                done[0] = true;
                sm.unregisterListener(l);
                result.finish();
            }
        }, 8000);
    }
}
