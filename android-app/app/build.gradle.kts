plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.ludora.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ludora.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        // The responsive web app this native shell renders.
        buildConfigField("String", "SITE_URL", "\"https://ludo-king-match.vercel.app\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { buildConfig = true }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.swiperefresh)
    implementation(libs.androidx.splashscreen)
    implementation(libs.androidx.browser)
}
