package com.ludora.app

import android.app.Application
import com.ludora.app.di.Graph

class LudoraApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Graph.init(this)
    }
}
