plugins {
    id("com.android.application")
}

// The web app this wraps. Change it here and the manifest, the asset link and
// the launch URL all follow.
val siteHost = "erikmeyers-blip.github.io"
val sitePath = "/coffee-passport/"

android {
    namespace = "com.erikmeyers.coffeepassport"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.erikmeyers.coffeepassport"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"

        manifestPlaceholders["siteHost"] = siteHost
        manifestPlaceholders["sitePath"] = sitePath
        manifestPlaceholders["launchUrl"] = "https://$siteHost$sitePath"
        resValue(
            "string", "asset_statements",
            """[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"web","site":"https://$siteHost"}}]"""
        )
    }

    buildFeatures {
        resValues = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.4")
}
