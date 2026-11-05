package com.tahadi.thalathin;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/* جدولة تنبيهات الأذان والتذكير المسائي */
public class AlarmScheduler {

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("alarms", Context.MODE_PRIVATE);
    }

    static void setAlarm(AlarmManager am, long at, PendingIntent pi) {
        if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } else {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    private static PendingIntent intentFor(Context c, JSONObject o, int flags) {
        int id = o.optInt("id");
        Intent i = new Intent(c, NotifyReceiver.class);
        i.setAction("com.tahadi.thalathin.NOTIFY." + id);
        i.putExtra("id", id);
        i.putExtra("title", o.optString("title"));
        i.putExtra("body", o.optString("body"));
        i.putExtra("ch", o.optString("ch", "daily"));
        return PendingIntent.getBroadcast(c, id, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    static synchronized void schedule(Context c, String json) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        try {
            // إلغاء القديم
            JSONArray old = new JSONArray(prefs(c).getString("list", "[]"));
            for (int k = 0; k < old.length(); k++) {
                PendingIntent pi = intentFor(c, old.getJSONObject(k), PendingIntent.FLAG_NO_CREATE);
                if (pi != null) { am.cancel(pi); pi.cancel(); }
            }
            JSONArray list = new JSONArray(json);
            prefs(c).edit().putString("list", list.toString()).apply();
            arm(c, am, list);
        } catch (Exception ignored) { }
    }

    private static void arm(Context c, AlarmManager am, JSONArray list) throws Exception {
        long now = System.currentTimeMillis();
        for (int k = 0; k < list.length(); k++) {
            JSONObject o = list.getJSONObject(k);
            long at = o.optLong("at");
            if (at > now) setAlarm(am, at, intentFor(c, o, PendingIntent.FLAG_UPDATE_CURRENT));
        }
    }

    /* بعد إعادة تشغيل الجهاز */
    static void restore(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        try { arm(c, am, new JSONArray(prefs(c).getString("list", "[]"))); } catch (Exception ignored) { }
    }
}
