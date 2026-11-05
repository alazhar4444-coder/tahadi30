package com.tahadi.thalathin;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;

public class NotifyReceiver extends BroadcastReceiver {

    static void createChannels(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel prayer = new NotificationChannel("prayer", "مواقيت الصلاة", NotificationManager.IMPORTANCE_HIGH);
        prayer.setDescription("تنبيه عند دخول وقت كل صلاة");
        prayer.enableVibration(true);
        prayer.setLightColor(Color.GREEN);
        NotificationChannel daily = new NotificationChannel("daily", "التذكيرات اليومية", NotificationManager.IMPORTANCE_DEFAULT);
        daily.setDescription("تذكير بتسجيل إنجازات اليوم");
        nm.createNotificationChannel(prayer);
        nm.createNotificationChannel(daily);
    }

    @Override
    public void onReceive(Context c, Intent intent) {
        if (Build.VERSION.SDK_INT >= 33
                && c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        createChannels(c);
        String ch = intent.getStringExtra("ch");
        if (ch == null) ch = "daily";
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int id = intent.getIntExtra("id", 1);

        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification n = new Notification.Builder(c, ch)
                .setSmallIcon(R.drawable.ic_notif)
                .setColor(Color.parseColor("#1F5A44"))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory("prayer".equals(ch) ? Notification.CATEGORY_ALARM : Notification.CATEGORY_REMINDER)
                .build();
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm != null) nm.notify(id, n);
    }
}
