package com.tahadi.thalathin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/* إعادة ضبط التنبيهات بعد تشغيل الجهاز أو تحديث التطبيق أو تغيير الوقت */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Context c = context.getApplicationContext();
        NotifyReceiver.createChannels(c);
        AlarmScheduler.restore(c);
        StepSnapshotReceiver.scheduleNightly(c);
    }
}
