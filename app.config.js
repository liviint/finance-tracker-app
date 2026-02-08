import 'dotenv/config';

export default {
  expo: {
    scheme: "zeniamoney",
    name: "ZeniaMoney",
    slug: "zeniamoney",
    version: "1.0.15",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zeniahub.zeniamoney",
      associatedDomains: ["applinks:zeniahub.com"],
    },

    android: {
      package: "com.zeniahub.zeniamoney",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,

      enableProguardInReleaseBuilds: true,

      "intentFilters": [
          // 1. Regular Deep Link (zeniahub://)
          {
            "action": "VIEW",
            "category": ["BROWSABLE", "DEFAULT"],
            "data": [
              { scheme: "zeniamoney" }
            ]
          },
          // 2. Universal App Link (https://zeniahub.com)
          {
            "action": "VIEW",
            "autoVerify": true, 
            "category": ["BROWSABLE", "DEFAULT"],
            "data": [
              { "scheme": "https", "host": "zeniahub.com", "pathPrefix": "/" }
            ]
          }
        ],
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },


    web: {
      output: "static",
      favicon: "./assets/images/logo.png",
    },

    plugins: [
      "expo-router",
      "expo-sqlite",
      "@react-native-community/datetimepicker",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      router: {},
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.zeniahub.com/api",
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || "f2a2cdc0-3be6-4482-9fea-ef4528851e01",
      },
    },

    owner: process.env.EXPO_OWNER || "zeniamoney"
  },
};
