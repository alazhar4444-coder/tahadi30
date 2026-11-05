package com.tahadi.thalathin;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/*
 * حسّاس TYPE_STEP_COUNTER يعطي مجموع الخطوات منذ آخر تشغيل للجهاز.
 * نحفظ آخر قراءة ونضيف الفرق إلى يوم اليوم.
 */
public class StepTracker {
    private final SharedPreferences p;

    StepTracker(Context ctx) {
        p = ctx.getApplicationContext().getSharedPreferences("steps", Context.MODE_PRIVATE);
    }

    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private JSONObject history() {
        try { return new JSONObject(p.getString("history", "{}")); }
        catch (JSONException e) { return new JSONObject(); }
    }

    synchronized void update(long total) {
        String day = today();
        JSONObject h = history();
        long last = p.getLong("last", -1);
        try {
            if (last >= 0) {
                long delta = total >= last ? total - last : total; // أقل = أُعيد تشغيل الجهاز
                if (delta > 60000) delta = 0;                       // قراءة غير منطقية
                h.put(day, h.optLong(day, 0) + delta);
            } else if (!h.has(day)) {
                h.put(day, 0);
            }
        } catch (JSONException ignored) { }
        p.edit().putLong("last", total).putString("history", h.toString()).apply();
    }

    synchronized String toJson(boolean available, boolean permitted) {
        JSONObject o = new JSONObject();
        try {
            o.put("available", available);
            o.put("permitted", permitted);
            o.put("history", history());
        } catch (JSONException ignored) { }
        return o.toString();
    }
}
